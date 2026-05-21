"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { User, Mail, Lock, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">Settings</h1>

      {}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />
          Profile
        </h2>
        <div className="space-y-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          {}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-white dark:text-neutral-900">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-neutral-400">{user?.email}</p>
            </div>
          </div>

          {}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
            />
          </div>

          {}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">Email cannot be changed</p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save changes"}
          </button>
        </div>
      </div>

      {}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Account
        </h2>
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Password</p>
            <p className="text-xs text-neutral-400 mb-3">Password changes require backend support</p>
            <button
              disabled
              className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-400 cursor-not-allowed"
            >
              Change password
            </button>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-sm font-medium text-red-500 mb-1">Danger zone</p>
            <p className="text-xs text-neutral-400 mb-3">These actions are irreversible</p>
            <button
              disabled
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 text-sm text-red-400 cursor-not-allowed"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="px-5 py-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <p className="text-xs text-neutral-400">
          <span className="font-medium text-neutral-900 dark:text-white">BlockVerse</span>
          {" · "}v1.0.0
          {" · "}Built with Next.js + Spring Boot
        </p>
      </div>
    </div>
  );
}