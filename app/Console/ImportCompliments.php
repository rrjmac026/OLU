<?php

namespace App\Console\Commands;

use App\Enums\ContentKind;
use App\Models\ContentItem;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Imports compliments from the `complimentjs` npm package (ISC license,
 * https://github.com/kingnebby/compliments). Safe to re-run: existing rows are skipped.
 */
class ImportCompliments extends Command
{
    protected $signature = 'content:import-compliments {--dry-run : Show counts without writing}';

    protected $description = 'Import compliments from the complimentjs package into content_items';

    /** Lines that do not fit a couples app (strangers, teams, school, meta text). */
    private const SKIP = [
        'babies', 'impeccable manners', 'super-size bag of chips', 'random factoids', 'hipsters',
        'I meant to do that', 'cute elbows', 'crayons', 'our community', 'great example to others',
        'internet meme', 'who raised you', 'your name suits', 'any team', 'high school', 'crossword',
        'great posture', 'awesome friend',
    ];

    public function handle(): int
    {
        $kind = ContentKind::tryFrom('compliment');

        if (! $kind) {
            $this->error("ContentKind has no 'compliment' value.");

            return self::FAILURE;
        }

        $path = collect([
            database_path('seeders/data/compliments.json'),
            base_path('node_modules/complimentjs/lib/compliments.json'),
        ])->first(fn (string $p) => is_file($p));

        if (! $path) {
            $this->error('compliments.json not found. Run `npm i -D complimentjs` first.');

            return self::FAILURE;
        }

        $list = json_decode((string) file_get_contents($path), true);

        if (! is_array($list)) {
            $this->error("Could not read {$path}");

            return self::FAILURE;
        }

        $added = 0;
        $skipped = 0;

        foreach ($list as $body) {
            $body = is_string($body) ? trim($body) : '';

            if ($body === '' || Str::contains($body, self::SKIP, true)) {
                $skipped++;

                continue;
            }

            if ($this->option('dry-run')) {
                $added++;

                continue;
            }

            $item = ContentItem::firstOrCreate(
                ['kind' => $kind->value, 'body' => $body],
                ['is_active' => true],
            );

            if ($item->wasRecentlyCreated) {
                $added++;
            }
        }

        $this->info(($this->option('dry-run') ? 'Would add' : 'Added') . " {$added} compliments, filtered out {$skipped}.");

        return self::SUCCESS;
    }
}