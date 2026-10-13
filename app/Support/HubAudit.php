<?php

namespace App\Support;

use App\Enums\HubEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

final class HubAudit
{
    /**
     * Record a hub operational activity log.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function record(HubEvent $event, Model $subject, ?User $causer = null, array $properties = []): void
    {
        $activity = activity('hub')
            ->performedOn($subject)
            ->event($event->value)
            ->withProperties($properties);

        if ($causer !== null) {
            $activity->causedBy($causer);
        } else {
            $activity->causedByAnonymous();
        }

        $activity->log($event->description());
    }
}
