<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    /**
     * Determine whether the user can view any reports.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('report.view_any');
    }

    /**
     * Determine whether the user can create reports.
     */
    public function create(User $user): bool
    {
        return $user->can('report.create');
    }

    /**
     * Determine whether the user can resolve the report.
     */
    public function resolve(User $user, ?Report $report = null): bool
    {
        return $user->can('report.resolve');
    }
}
