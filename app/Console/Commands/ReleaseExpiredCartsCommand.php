<?php

namespace App\Console\Commands;

use App\Actions\Cart\ReleaseExpiredCarts;
use Illuminate\Console\Command;

class ReleaseExpiredCartsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'unimart:release-expired-carts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Release expired cart soft-holds and restore item stock';

    /**
     * Execute the console command.
     */
    public function handle(ReleaseExpiredCarts $action): int
    {
        $released = $action->handle();

        $this->info("Released {$released} expired cart(s).");

        return self::SUCCESS;
    }
}
