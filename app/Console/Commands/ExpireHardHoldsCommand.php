<?php

namespace App\Console\Commands;

use App\Actions\Orders\ExpireHardHolds;
use Illuminate\Console\Command;

class ExpireHardHoldsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'unimart:expire-hard-holds';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire unattended hard hold order reservations and restore inventory';

    /**
     * Execute the console command.
     */
    public function handle(ExpireHardHolds $action): int
    {
        $expired = $action->handle();

        $this->info("Expired {$expired} order reservation(s).");

        return self::SUCCESS;
    }
}
