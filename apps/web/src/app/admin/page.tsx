"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

const ADMIN_EMAILS = [
  "jonathan@jasonjewels.com",
  "jason@jasonjewels.com",
  "jyushuvayev98@gmail.com",
];

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const email = user?.emailAddresses[0]?.emailAddress;
      if (email && ADMIN_EMAILS.includes(email)) {
        setAuthorized(true);
      } else {
        router.replace("/");
      }
    }
  }, [isLoaded, user, router]);

  if (!authorized) return null;

  return <AdminDashboard />;
}
