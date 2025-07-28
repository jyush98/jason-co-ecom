// 📁 SSO Callback page route
// File: app/(auth)/sso-callback/page.tsx
import { SSOCallback } from "@/components/auth";

export default function SSOCallbackPage() {
  return <SSOCallback />;
}

export const metadata = {
  title: "Signing you in... | Jason & Co.",
  description: "Completing your secure sign-in process.",
};