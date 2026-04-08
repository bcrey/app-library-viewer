"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";
import { AppLink } from "@/types";
import { appService } from "@/lib/appService";
import AppGrid from "@/components/AppGrid";

export default function HomePage() {
  const [links, setLinks] = useState<AppLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await fetch("/api/apps/seed", { method: "POST" });
      const data = await appService.getLinks();
      setLinks(data);
      setLoading(false);
    }
    init();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          App Library
        </h1>
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg bg-gray-800/60 px-4 py-2 text-sm font-medium text-gray-300 ring-1 ring-white/10 transition-all hover:bg-gray-700/80 hover:text-white hover:ring-white/20"
        >
          <Settings className="h-4 w-4" />
          Manage
        </Link>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-indigo-500" />
        </div>
      ) : (
        <AppGrid links={links} />
      )}
    </div>
  );
}
