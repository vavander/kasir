import { PropsWithChildren, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
    className?: string;
    /** Max tilt in degrees. */
    max?: number;
}

/**
 * Lightweight 3D tilt-on-hover wrapper (pure CSS transforms, no libraries).
 * The card rotates toward the cursor and shows a soft glare for depth.
 */
export default function TiltCard({ className, max = 8, children }: PropsWithChildren<TiltCardProps>) {
    const ref = useRef<HTMLDivElement>(null);
    const glareRef = useRef<HTMLDivElement>(null);

    const reduceMotion = () =>
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el || reduceMotion()) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * max * 2;
        const ry = (px - 0.5) * max * 2;
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
        if (glareRef.current) {
            glareRef.current.style.opacity = '1';
            glareRef.current.style.background = `radial-gradient(circle at ${(px * 100).toFixed(0)}% ${(py * 100).toFixed(0)}%, rgba(255,255,255,0.35), transparent 45%)`;
        }
    };

    const handleLeave = () => {
        const el = ref.current;
        if (!el) return;
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
        if (glareRef.current) glareRef.current.style.opacity = '0';
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className={cn(
                'relative rounded-xl transition-transform duration-200 ease-out will-change-transform',
                className,
            )}
        >
            {children}
            <div
                ref={glareRef}
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200"
                aria-hidden="true"
            />
        </div>
    );
}
