"use client";

import { useState } from "react";
import AdminOrderList from "./AdminOrderList";
import AdminCustomOrderList from "./AdminCustomOrderList";

const tabs = ["Orders", "Custom Orders"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Orders");

  return (
    <main className="min-h-screen p-6 text-white bg-black pt-[var(--navbar-height)]">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tab switcher */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded border ${
              activeTab === tab ? "bg-white text-black" : "border-white"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "Orders" && <AdminOrderList />}
      {activeTab === "Custom Orders" && <AdminCustomOrderList />}
    </main>
  );
}
