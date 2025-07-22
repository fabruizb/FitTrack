import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface ShimmerButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode;
    href: string;
    className?: string;
    background?: string;
}

const ShimmerButton = React.forwardRef<HTMLAnchorElement, ShimmerButtonProps>(
    ({ children, href, className, background = "hsl(var(--primary))", ...props }, ref) => {
        return (
            <Link
                href={href}
                ref={ref}
                style={{
                    '--background': background,
                } as React.CSSProperties}
                className={cn(
                    "group relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-[--background] px-8 font-medium text-primary-foreground transition-colors sm:w-auto",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "animate-shimmer bg-[linear-gradient(110deg,var(--background),45%,#ffffff80,55%,var(--background))] bg-[length:200%_100%]",
                    className,
                )}
                {...props}
            >
                {children}
            </Link>
        );
    }
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
