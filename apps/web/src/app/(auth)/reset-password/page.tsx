// 📁 Password reset page route
// File: app/(auth)/reset-password/page.tsx
import { PasswordResetPage } from "@/components/auth";

export default function ResetPasswordPage() {
  return <PasswordResetPage />;
}

export const metadata = {
  title: "Reset Password | Jason & Co.",
  description: "Reset your Jason & Co. account password securely.",
};