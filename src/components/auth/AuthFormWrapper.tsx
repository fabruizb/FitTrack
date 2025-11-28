
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AuthFormWrapperProps {
    title: string;
    description?: string;
    children: ReactNode;
    footerContent?: ReactNode;
    className?: string;
}

export function AuthFormWrapper({ title, description, children, footerContent, className }: AuthFormWrapperProps) {
    return (
        <div className="flex min-h-[calc(100vh-4rem-1px)] items-center justify-center bg-none p-4">
            <Card className={`w-full max-w-md shadow-xl  bg-[#023257]/30 backdrop-blur-lg text-card-foreground ${className}`}>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">{title}</CardTitle>
                    {description && <CardDescription className="text-md text-card-foreground/80 pt-1">{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {children}
                    {footerContent && <div className="mt-6 text-center text-sm text-card-foreground/70">{footerContent}</div>}
                </CardContent>
            </Card>
        </div>
    );
}
