<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaffHasOpenShift
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->hasOpenShift()) {
            return redirect()->route('staff.drawer-count')
                ->with('error', 'Please open a shift before performing desk operations.');
        }

        return $next($request);
    }
}
