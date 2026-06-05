import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, setTheme, Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const options: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Terang' },
    { value: 'system', icon: Monitor, label: 'Sistem' },
    { value: 'dark', icon: Moon, label: 'Gelap' },
];

export default function ThemeToggle({ className }: { className?: string }) {
    const [theme, setThemeState] = useState<Theme>('system');

    useEffect(() => {
        setThemeState(getStoredTheme());
    }, []);

    // Follow OS changes while in system mode.
    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const choose = (value: Theme) => {
        setThemeState(value);
        setTheme(value);
    };

    return (
        <div className={cn('inline-flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5', className)}>
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={theme === value}
                    onClick={() => choose(value)}
                    className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-md transition-colors',
                        theme === value
                            ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    )}
                >
                    <Icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
}
