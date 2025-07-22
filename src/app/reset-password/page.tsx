import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Auth Starter',
  description: 'Reset your account password.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
