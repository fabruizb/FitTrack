"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfileFormData } from "@/lib/types";
import { UserProfileSchema, trainingGoals } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface UserProfileModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function UserProfileModal({ isOpen, onOpenChange }: UserProfileModalProps) {
    const { user, userProfile, updateAuthProfile, saveUserProfileToFirestore, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UserProfileFormData>({
        resolver: zodResolver(UserProfileSchema),
        defaultValues: {
            displayName: "",
            weight: undefined,
            age: undefined,
            trainingGoal: "",
        },
    });

    useEffect(() => {
        if (isOpen && user) {
            form.reset({
                displayName: userProfile?.displayName || user.displayName || "",
                weight: userProfile?.weight || undefined,
                age: userProfile?.age || undefined,
                trainingGoal: userProfile?.trainingGoal || "",
            });
        }
    }, [isOpen, user, userProfile, form]);

    const onSubmit = async (data: UserProfileFormData) => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "Debes estar autenticado." });
            return;
        }
        setIsSubmitting(true);

        const { displayName, ...firestoreData } = data;

        try {
            if (displayName !== (user.displayName || "")) {
                await updateAuthProfile(displayName);
            }

            await saveUserProfileToFirestore({
                ...firestoreData,
                displayName: displayName || user.displayName || "",
            });

            toast({ title: "Perfil Actualizado", description: "Tu información de perfil ha sido guardada." });
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al Actualizar", description: error.message || "No se pudo actualizar el perfil." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = authLoading || isSubmitting;

    if (!user && isOpen) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                        <DialogDescription>Usuario no encontrado.</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!isLoading) onOpenChange(open); }}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>Actualiza tu información personal y preferencias.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Visible</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tu nombre visible" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Peso (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Tu peso en kg" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} disabled={isLoading} />
                                        </FormControl>
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
                                            <Input type="number" placeholder="Tu edad" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="trainingGoal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objetivo de Entrenamiento</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
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

                        <DialogFooter className="mt-8">
                            <DialogClose asChild>
                                <Button variant="outline" type="button" disabled={isLoading}>Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
