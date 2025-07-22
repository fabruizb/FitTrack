"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextAnimateProps extends HTMLAttributes<HTMLDivElement> {
    children: string;
    once?: boolean;
}

export function TextAnimate({ children, className, once = true, ...props }: TextAnimateProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount: 0.5 });

    const textChars = children.split("");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
        }),
    };

    const charVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(8px)",
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            aria-label={children}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={cn("block", className)}
            {...props}
        >
            {textChars.map((char, index) => (
                <motion.span
                    key={index}
                    variants={charVariants}
                    style={{ display: "inline-block", whiteSpace: "pre-wrap" }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.div>
    );
}
