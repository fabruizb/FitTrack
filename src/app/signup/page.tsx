import { SignupForm } from "@/components/auth/SignupForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Auth Starter',
  description: 'Create a new account to get started.',
};

export default function SignupPage() {
  return <SignupForm />;
}
