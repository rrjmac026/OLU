<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

class PruneActivityLogs extends Command
{
    protected $signature = 'activity:prune {--days=90 : Delete logs older than this many days}';

    protected $description = 'Delete old activity logs';

    public function handle(): int
    {
        $count = ActivityLog::where('created_at', '<', now()->subDays((int) $this->option('days')))->delete();
        $this->info("Deleted {$count} activity log(s).");

        return self::SUCCESS;
    }
}