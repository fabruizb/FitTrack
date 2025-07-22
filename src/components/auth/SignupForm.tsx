"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import type { SignupFormData } from "@/lib/types";
import { SignupSchema, trainingGoals } from "@/lib/types";
import { AuthFormWrapper } from "./AuthFormWrapper";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignupForm() {
    const { signup, loading: authContextLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const form = useForm<SignupFormData>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            age: "" as unknown as number,
            height: "" as unknown as number,
            weight: "" as unknown as number,
            trainingGoal: "",
        },
    });

    async function onSubmit(data: SignupFormData) {
        setIsSubmitting(true);
        const newUser = await signup(data);
        setIsSubmitting(false);
        if (newUser) {
            router.push('/dashboard');
        }
    }

    const isLoading = authContextLoading || isSubmitting;

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <AuthFormWrapper
            title="Crea tu cuenta"
            description="Completa tus datos para unirte."
            className="max-w-2xl"
            footerContent={
                <p className="text-muted-foreground text-sm">
                    ¿Ya tienes una cuenta?{" "}
                    <Button variant="link" asChild className="p-0 h-auto text-accent underline">
                        <Link href="/login">Inicia sesión</Link>
                    </Button>
                </p>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Tu nombre completo"
                                            {...field}
                                            className="h-12 rounded-lg border bg-muted/30 p-3 placeholder:text-muted-foreground"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="tu@ejemplo.com"
                                            {...field}
                                            className="h-12 rounded-lg border bg-muted/30 p-3 placeholder:text-muted-foreground"
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
                                    <FormLabel>Contraseña</FormLabel>
                                    <div className="relative flex items-center">
                                        <FormControl>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="h-12 rounded-lg border bg-muted/30 p-3 placeholder:text-muted-foreground pr-10 w-full"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-auto p-2 text-muted-foreground hover:text-foreground"
                                            onClick={togglePasswordVisibility}
                                            disabled={isLoading}
                                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Contraseña</FormLabel>
                                    <div className="relative flex items-center">
                                        <FormControl>
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="h-12 rounded-lg border bg-muted/30 p-3 placeholder:text-muted-foreground pr-10 w-full"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-auto p-2 text-muted-foreground hover:text-foreground"
                                            onClick={toggleConfirmPasswordVisibility}
                                            disabled={isLoading}
                                            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Edad</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Tu edad"
                                            {...field}
                                            className="h-12 rounded-lg border bg-muted/30 p-3 placeholder:text-muted-foreground"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Altura (cm)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Tu altura en cm"
                                            {...field}
                                            className="h-12 rounded-lg border bg-muted/30 p-3 placeholder:text-muted-foreground"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Peso (kg)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Tu peso en kg"
                                            {...field}
                                            className="h-12 rounded-lg border bg-muted/30 p-3 placeholder:text-muted-foreground"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="trainingGoal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objetivo de Entrenamiento</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-lg border bg-muted/30 p-3">
                                                <SelectValue placeholder="Selecciona tu objetivo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {trainingGoals.map(goal => (
                                                <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-lg px-5 font-bold text-base mt-6"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creando Cuenta..." : "Registrarse"}
                    </Button>
                </form>
            </Form>
        </AuthFormWrapper>
    );
}
