// 📁 Sign-up page route
// File: app/(auth)/sign-up/page.tsx
import { CustomSignUpPage } from "@/components/auth";

export default function SignUpPage() {
  return <CustomSignUpPage />;
}

export const metadata = {
  title: "Create Account | Jason & Co.",
  description: "Join Jason & Co. to access exclusive jewelry collections, custom designs, and member-only benefits.",
};