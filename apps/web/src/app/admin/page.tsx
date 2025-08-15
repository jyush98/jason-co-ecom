"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { ADMIN_EMAIL_ADDRESSES } from "@/config/businessInfo";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const email = user?.emailAddresses[0]?.emailAddress;
      if (email && ADMIN_EMAIL_ADDRESSES.includes(email)) {
        setAuthorized(true);
      } else {
        router.replace("/");
      }
    }
  }, [isLoaded, user, router]);

  if (!authorized) return null;

  return (
    <div className="pt-[var(--navbar-height)] bg-white dark:bg-gray-800">
      <AdminDashboard />
    </div>
  );
}
