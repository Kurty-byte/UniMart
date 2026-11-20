import { useEffect, useState } from 'react';

export interface CountdownState {
    remainingMs: number;
    isExpired: boolean;
    formatted: string;
    hours: number;
    minutes: number;
    seconds: number;
}

function computeState(targetIso: string | null | undefined): CountdownState {
    if (!targetIso) {
        return {
            remainingMs: 0,
            isExpired: true,
            formatted: '00:00',
            hours: 0,
            minutes: 0,
            seconds: 0,
        };
    }

    const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted =
        hours > 0
            ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
            : `${pad(minutes)}:${pad(seconds)}`;

    return {
        remainingMs: diff,
        isExpired: diff <= 0,
        formatted,
        hours,
        minutes,
        seconds,
    };
}

export function useCountdown(targetIso: string | null | undefined): CountdownState {
    const [state, setState] = useState<CountdownState>(() => computeState(targetIso));

    useEffect(() => {
        setState(computeState(targetIso));

        if (!targetIso) {
            return;
        }

        const interval = window.setInterval(() => {
            const next = computeState(targetIso);
            setState(next);
            if (next.isExpired) {
                window.clearInterval(interval);
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [targetIso]);

    return state;
}
