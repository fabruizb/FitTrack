import React from "react";
import { cn } from "@/lib/utils";

export const Ripple = () => {
    return (
        <div
            className={cn(
                "absolute inset-0 z-0 flex items-center justify-center",
            )}
        >
            <div className="absolute h-0 w-0 animate-ripple rounded-full border border-primary/30 [animation-delay:0s]"></div>
            <div className="absolute h-0 w-0 animate-ripple rounded-full border border-secondary/30 [animation-delay:1s]"></div>
            <div className="absolute h-0 w-0 animate-ripple rounded-full border border-accent/30 [animation-delay:2s]"></div>
        </div>
    );
};
