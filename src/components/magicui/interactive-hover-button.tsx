import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { ReactNode } from "react";

interface InteractiveHoverButtonProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: ReactNode;
    href: string;
    containerClassName?: string;
    className?: string;
}

const InteractiveHoverButton = React.forwardRef<
    HTMLAnchorElement,
    InteractiveHoverButtonProps
>(({ children, href, containerClassName, className, ...props }, ref) => {
    return (
        <Link
            href={href}
            ref={ref}
            className={cn(
                "group relative w-full overflow-hidden rounded-lg bg-secondary p-px font-sans font-bold leading-normal text-secondary-foreground transition-all duration-300 hover:w-full hover:shadow-lg sm:w-auto",
                containerClassName,
            )}
            {...props}
        >
            <div className="absolute inset-0 w-full rounded-lg bg-secondary" />
            <div
                className={cn(
                    "relative z-10 flex h-11 items-center justify-center gap-2 rounded-[7px] bg-background px-8 text-foreground transition-all duration-300 group-hover:bg-transparent group-hover:text-secondary-foreground",
                    className,
                )}
            >
                {children}
            </div>
        </Link>
    );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
export { InteractiveHoverButton };
