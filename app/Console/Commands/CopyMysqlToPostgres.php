<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CopyMysqlToPostgres extends Command
{
    protected $signature = 'db:copy-from-mysql {--skip=* : extra tables to skip}';

    protected $description = 'Copy all data from the old MySQL (mysql_source) into the current Postgres connection';

    /** Rebuilt automatically or useless after a move (users just log in again). */
    private const ALWAYS_SKIP = ['migrations', 'sessions', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs'];

    public function handle(): int
    {
        $targetName = config('database.default');

        if (config("database.connections.{$targetName}.driver") !== 'pgsql') {
            $this->error("DB_CONNECTION must be pgsql (it is '{$targetName}').");

            return self::FAILURE;
        }

        $source = DB::connection('mysql_source');
        $target = DB::connection($targetName);
        $sourceSchema = Schema::connection('mysql_source');
        $targetSchema = Schema::connection($targetName);

        try {
            $source->getPdo();
            $target->getPdo();
        } catch (\Throwable $e) {
            $this->error('Could not connect: '.$e->getMessage());

            return self::FAILURE;
        }

        $skip = array_merge(self::ALWAYS_SKIP, $this->option('skip'));

        $sourceTables = array_column($sourceSchema->getTables(), 'name');
        $targetTables = collect($targetSchema->getTables())
            ->filter(fn ($t) => ($t['schema'] ?? 'public') === 'public')
            ->pluck('name')
            ->all();

        $tables = array_values(array_diff(array_intersect($sourceTables, $targetTables), $skip));

        foreach (array_diff($sourceTables, $targetTables, $skip) as $name) {
            $this->warn("Not on Postgres, skipped: {$name} (did migrate run?)");
        }

        $tables = $this->orderByDependencies($targetSchema, $tables);

        $this->line('Tables to copy: '.implode(', ', $tables));

        $db = config("database.connections.{$targetName}.database");
        $host = config("database.connections.{$targetName}.host");

        if (! $this->confirm("This ERASES those tables on {$host}/{$db} and replaces them with the MySQL data. Continue?")) {
            return self::FAILURE;
        }

        $report = [];

        $target->transaction(function () use ($source, $target, $targetSchema, $tables, &$report) {
            $quoted = implode(', ', array_map(fn ($t) => '"'.$t.'"', $tables));
            $target->statement("TRUNCATE TABLE {$quoted} RESTART IDENTITY CASCADE");

            foreach ($tables as $table) {
                $copied = $this->copyTable($source, $target, $targetSchema, $table);
                $report[] = [$table, $source->table($table)->count(), $copied];
            }
        });

        $this->table(['Table', 'MySQL rows', 'Copied'], $report);

        $bad = array_filter($report, fn ($r) => $r[1] !== $r[2]);
        $bad ? $this->error('Some counts do not match, check above.') : $this->info('Done. All counts match.');

        return $bad ? self::FAILURE : self::SUCCESS;
    }

    private function copyTable($source, $target, $targetSchema, string $table): int
    {
        $columns = $targetSchema->getColumns($table);
        $names = array_column($columns, 'name');
        $bools = array_column(array_filter($columns, fn ($c) => ($c['type_name'] ?? '') === 'bool'), 'name');

        $convert = function ($row) use ($names, $bools) {
            $out = [];

            foreach ((array) $row as $col => $value) {
                if (! in_array($col, $names, true)) {
                    continue;
                }

                // MySQL gives 0/1, Postgres wants real booleans.
                $out[$col] = ($value !== null && in_array($col, $bools, true)) ? (bool) $value : $value;
            }

            return $out;
        };

        $count = 0;
        $flush = function (array $batch) use ($target, $table, &$count) {
            if ($batch) {
                $target->table($table)->insert($batch);
                $count += count($batch);
            }
        };

        $query = $source->table($table);

        if (in_array('id', $names, true)) {
            $query->orderBy('id')->chunkById(500, fn ($rows) => $flush($rows->map($convert)->all()));

            // Make the next insert continue after the highest copied id.
            $target->statement(sprintf(
                "SELECT setval(pg_get_serial_sequence('\"%1\$s\"', 'id'), COALESCE((SELECT MAX(id) FROM \"%1\$s\"), 1), (SELECT MAX(id) FROM \"%1\$s\") IS NOT NULL)",
                $table
            ));
        } else {
            foreach ($query->get()->chunk(500) as $chunk) {
                $flush($chunk->map($convert)->all());
            }
        }

        return $count;
    }

    /** Parents before children, so foreign keys are never violated. */
    private function orderByDependencies($schema, array $tables): array
    {
        $deps = [];

        foreach ($tables as $t) {
            $deps[$t] = array_values(array_unique(array_filter(
                array_column($schema->getForeignKeys($t), 'foreign_table'),
                fn ($d) => $d !== $t && in_array($d, $tables, true)
            )));
        }

        $ordered = [];

        while ($deps) {
            $progress = false;

            foreach ($deps as $t => $needs) {
                if (! array_diff($needs, $ordered)) {
                    $ordered[] = $t;
                    unset($deps[$t]);
                    $progress = true;
                }
            }

            if (! $progress) { // circular keys: append the rest and hope
                $ordered = array_merge($ordered, array_keys($deps));
                break;
            }
        }

        return $ordered;
    }
}