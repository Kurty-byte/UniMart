<?php

namespace App\Console\Commands;

use App\Actions\Staff\ExpireShelfItems;
use Illuminate\Console\Command;

class ExpireShelfItemsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'unimart:expire-shelf-items';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire unsold consignment items that reached their shelf-life limit';

    /**
     * Execute the console command.
     */
    public function handle(ExpireShelfItems $action): int
    {
        $expired = $action->handle();

        $this->info("Expired {$expired} shelf item(s).");

        return self::SUCCESS;
    }
}
