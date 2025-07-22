import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface ShinyButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode;
    href: string;
    variant?: "default" | "secondary";
}

const ShinyButton = React.forwardRef<HTMLAnchorElement, ShinyButtonProps>(
    ({ children, className, href, variant = "default", ...props }, ref) => {
        return (
            <Link
                href={href}
                ref={ref}
                {...props}
                className={cn(
                    "group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-lg px-8 font-medium transition-shadow",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "shadow-lg hover:shadow-xl",
                    {
                        "bg-primary text-primary-foreground": variant === "default",
                        "bg-secondary text-secondary-foreground": variant === "secondary",
                    },
                    className
                )}
            >
                
                <span
                    className={cn(
                        "absolute inset-0 z-0 h-full w-full",
                        "bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.25),55%,transparent)]",
                        "bg-[length:250%_100%]",
                        "transition-[background-position] duration-1000 ease-in-out",
                        "group-hover:bg-[position:200%_0]",
                    )}
                />
            </Link>
        );
    },
);

ShinyButton.displayName = "ShinyButton";
export { ShinyButton };
