
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import type { ResetPasswordFormData } from "@/lib/types";
import { ResetPasswordSchema } from "@/lib/types";
import { AuthFormWrapper } from "./AuthFormWrapper";
import { useState } from "react";

export function ResetPasswordForm() {
    const { resetPassword, loading: authLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: ResetPasswordFormData) {
        setIsSubmitting(true);
        await resetPassword(data);
        setIsSubmitting(false);
        form.reset();
    }

    const isLoading = authLoading || isSubmitting;

    return (
        <AuthFormWrapper
            title="Reset Your Password"
            description="Enter your email to receive reset instructions."
            className="max-w-lg"
            footerContent={
                <p className="text-muted-foreground text-sm">
                    Remembered your password?{" "}
                    <Button variant="link" asChild className="p-0 h-auto text-accent underline">
                        <Link href="/login">Log in</Link>
                    </Button>
                </p>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        {...field}
                                        className="h-14 rounded-lg border-0 bg-muted p-4 placeholder:text-muted-foreground"
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full h-12 rounded-lg px-5 font-bold text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Reset Email"}
                    </Button>
                </form>
            </Form>
        </AuthFormWrapper>
    );
}
