"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import type { LoginFormData } from "@/lib/types";
import { LoginSchema } from "@/lib/types";
import { AuthFormWrapper } from "./AuthFormWrapper";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
    const { login, loading: authContextLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginFormData) {
        setIsSubmitting(true);
        const loggedInUser = await login(data);
        setIsSubmitting(false);

        if (loggedInUser) {
            const redirectUrl = searchParams.get('redirect');
            if (redirectUrl) {
                router.push(redirectUrl);
            } else {
                router.push('/dashboard');
            }
        }
    }

    const isLoading = authContextLoading || isSubmitting;

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
        <AuthFormWrapper
            title="Bienvenido de nuevo!"
            description="acceso a tu cuenta."
            className="max-w-lg"
            footerContent={
                <p className="text-muted-foreground text-sm">
                    ¿No tienes una cuenta?{" "}
                    <Button variant="link" asChild className="p-0 h-auto text-accent underline">
                        <Link href="/signup">Registrarse</Link>
                    </Button>
                </p>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="tu@email.com"
                                        {...field}
                                        className="h-14 rounded-lg border-0 bg-muted p-4 placeholder:text-[#022D4E]"
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="relative flex items-center">
                                    <FormControl>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...field}
                                            className="h-14 rounded-lg border-0 bg-muted p-4 placeholder:text-[#022D4E] pr-12 w-full"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-2 text-muted-foreground hover:text-foreground"
                                        onClick={togglePasswordVisibility}
                                        disabled={isLoading}
                                        aria-label={showPassword ? "Hide password" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                </div>
                                <FormMessage />
                                <div className="text-right">
                                    <Button variant="link" size="sm" asChild className="p-0 h-auto text-sm text-accent underline">
                                        <Link href="/reset-password">Olvidaste tu contraseña?</Link>
                                    </Button>
                                </div>
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full h-12 rounded-lg px-5 font-bold text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging In..." : "Log In"}
                    </Button>
                </form>
            </Form>
        </AuthFormWrapper>
    );
}
