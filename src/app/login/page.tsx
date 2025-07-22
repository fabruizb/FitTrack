
import { Suspense } from 'react';
import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from 'next';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Login | Auth Starter',
  description: 'Log in to your account.',
};

function LoginContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
        <div className="flex h-[calc(100vh-4rem-1px)] items-center justify-center bg-background">
          <LoadingSpinner size="lg" />
        </div>
      }>
      <LoginContent />
    </Suspense>
  );
}
