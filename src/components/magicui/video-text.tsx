import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface VideoTextProps extends HTMLAttributes<HTMLDivElement> {
    src: string;
    children: string;
}

export const VideoText = ({
    children,
    src,
    className,
    ...props
}: VideoTextProps) => {
    return (
        <div
            className={cn(
                "relative w-full h-full flex items-center justify-center",
                className
            )}
            {...props}
        >
            <video
                className="absolute top-0 left-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={src} type="video/webm" />
                Tu navegador no soporta la etiqueta de video.
            </video>
            <div className="relative z-10 flex items-center justify-center w-full h-full mix-blend-screen bg-background">
                <h1 className="text-center font-headline text-7xl font-bold text-black">
                    {children}
                </h1>
            </div>
        </div>
    );
};
