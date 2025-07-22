"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface TypingAnimationProps extends HTMLAttributes<HTMLSpanElement> {
    children: string;
    duration?: number;
}

export function TypingAnimation({
    children,
    duration = 0.04,
    className,
    ...props
}: TypingAnimationProps) {
    const textChars = Array.from(children);

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: duration,
            },
        },
    };

    const charVariants = {
        hidden: {
            opacity: 0,
            y: 10,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.span
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn("inline-flex flex-wrap", className)}
            aria-label={children}
            {...props}
        >
            <span className="sr-only">{children}</span>
            {textChars.map((char, index) => (
                <motion.span
                    key={index}
                    variants={charVariants}
                    aria-hidden="true"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </motion.span>
    );
}
