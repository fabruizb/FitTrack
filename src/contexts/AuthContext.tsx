"use client";

import type { User, AuthError } from 'firebase/auth';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { LoginFormData, SignupFormData, ResetPasswordFormData, UserProfileFormData } from '@/lib/types';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

interface UserProfile extends UserProfileFormData {
    userId: string;
    email: string | null;
    createdAt?: Timestamp;
    lastUpdated?: Timestamp;
    displayName?: string | null;
    photoURL?: string | null;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: AuthError | null;
    setError: Dispatch<SetStateAction<AuthError | null>>;
    signup: (data: SignupFormData) => Promise<User | null>;
    login: (data: LoginFormData) => Promise<User | null>;
    logout: () => Promise<void>;
    resetPassword: (data: ResetPasswordFormData) => Promise<void>;
    updateAuthProfile: (displayName?: string | null) => Promise<void>;
    saveUserProfileToFirestore: (profileData: Partial<UserProfileFormData>) => Promise<void>;
    fetchUserProfileFromFirestore: (userId: string) => Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const fetchUserProfileFromFirestore = useCallback(async (userId: string): Promise<UserProfile | null> => {
        if (!db) {
            return null;
        }
        const userProfileRef = doc(db, "userProfiles", userId);
        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                return docSnap.data() as UserProfile;
            } else {
                return null;
            }
        } catch (error: any) {
            return null;
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const profile = await fetchUserProfileFromFirestore(currentUser.uid);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [fetchUserProfileFromFirestore]);

    const updateAuthProfile = async (displayName?: string | null) => {
        if (!auth.currentUser) return;
        try {
            await updateProfile(auth.currentUser, { displayName: displayName ?? undefined });
            setUser(prevUser => prevUser ? { ...prevUser, displayName: displayName ?? prevUser.displayName } : null);
            setUserProfile(prevProfile => prevProfile ? { ...prevProfile, displayName: displayName ?? prevProfile.displayName } : null)
            toast({ title: "Perfil Actualizado", description: "Tu perfil de autenticación ha sido actualizado." });
        } catch (e) {
            setError(e as AuthError);
            toast({ variant: "destructive", title: "Error de Actualización", description: (e as AuthError).message });
        }
    };

    const saveUserProfileToFirestore = async (profileData: Partial<UserProfileFormData>) => {
        if (!user?.uid || !db) {
            toast({ variant: "destructive", title: "Error", description: "Usuario no autenticado o base de datos no disponible." });
            return;
        }
        const userProfileRef = doc(db, "userProfiles", user.uid);
        try {
            const dataToSave: Partial<UserProfile> = {
                ...profileData,
                userId: user.uid,
                email: user.email,
                displayName: profileData.displayName || user.displayName || null,
                photoURL: userProfile?.photoURL || user.photoURL || null,
                lastUpdated: Timestamp.now(),
            };

            const docSnap = await getDoc(userProfileRef);
            if (!docSnap.exists()) {
                dataToSave.createdAt = Timestamp.now();
            }

            await setDoc(userProfileRef, dataToSave, { merge: true });

            const updatedProfile = await fetchUserProfileFromFirestore(user.uid);
            setUserProfile(updatedProfile);

            toast({ title: "Perfil Guardado", description: "Tus datos de perfil han sido guardados ." });
        } catch (e: any) {
            setError(e as AuthError);
            toast({ variant: "destructive", title: "Error al Guardar", description: `No se pudo guardar el perfil. ${e.message}` });
        }
    };

    const signup = async (data: SignupFormData) => {
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const newUser = userCredential.user;

            await updateProfile(newUser, {
                displayName: data.fullName,
                photoURL: null,
            });

            const profileToSave: UserProfile = {
                userId: newUser.uid,
                email: newUser.email,
                displayName: data.fullName,
                photoURL: null,
                age: data.age,
                height: data.height,
                weight: data.weight,
                trainingGoal: data.trainingGoal,
                gender: data.gender,
                createdAt: Timestamp.now(),
                lastUpdated: Timestamp.now(),
            };
            const userProfileRef = doc(db, "userProfiles", newUser.uid);
            await setDoc(userProfileRef, profileToSave);

            setUser(auth.currentUser);
            setUserProfile(profileToSave);

            toast({ title: "Cuenta Creada", description: "¡Bienvenido! Tu cuenta ha sido creada exitosamente." });
            return auth.currentUser;
        } catch (e) {
            const authError = e as AuthError;
            setError(authError);

            let errorMessage = "Ocurrió un error inesperado al crear la cuenta.";
            switch (authError.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este correo electrónico ya está en uso. Por favor, inicia sesión o usa otro correo.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El formato del correo electrónico no es válido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
                    break;
            }

            toast({ variant: "destructive", title: "Error de Registro", description: errorMessage });
            return null;
        }
    };

    const login = async (data: LoginFormData) => {
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const loggedInUser = userCredential.user;
            setUser(loggedInUser);
            const profile = await fetchUserProfileFromFirestore(loggedInUser.uid);
            setUserProfile(profile);

            toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!" });
            return loggedInUser;
        } catch (e) {
            const authError = e as AuthError;
            setError(authError);

            let errorMessage = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
            switch (authError.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El formato del correo electrónico no es válido.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Esta cuenta ha sido deshabilitada.';
                    break;
            }

            toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: errorMessage });
            return null;
        }
    };

    const logout = async () => {
        setError(null);
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            toast({ title: "Sesión Cerrada", description: "Has cerrado sesión exitosamente." });
            router.push('/login');
        } catch (e) {
            setError(e as AuthError);
            toast({ variant: "destructive", title: "Error al Cerrar Sesión", description: (e as AuthError).message });
        }
    };

    const resetPassword = async (data: ResetPasswordFormData) => {
        setError(null);
        try {
            await sendPasswordResetEmail(auth, data.email);
            toast({ title: "Correo de Restablecimiento Enviado", description: "Revisa tu bandeja de entrada para las instrucciones." });
        } catch (e) {
            setError(e as AuthError);
            toast({ variant: "destructive", title: "Error al Restablecer", description: (e as AuthError).message });
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            loading,
            error,
            setError,
            signup,
            login,
            logout,
            resetPassword,
            updateAuthProfile,
            saveUserProfileToFirestore,
            fetchUserProfileFromFirestore
        }}>
            {children}
        </AuthContext.Provider>
    );
}
