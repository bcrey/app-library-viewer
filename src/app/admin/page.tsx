"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { AppLink } from "@/types";
import { appService } from "@/lib/appService";
import AdminLinkForm from "@/components/AdminLinkForm";
import AdminLinkRow from "@/components/AdminLinkRow";

function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onAuthenticated();
      } else {
        setError("Wrong password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 ring-1 ring-white/10">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Admin Access</h1>
          <p className="text-sm text-gray-500">Enter the password to continue</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          disabled={loading}
          className="w-full rounded-lg bg-gray-800/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 ring-1 ring-white/10 transition-all focus:outline-none focus:ring-indigo-500/50 disabled:opacity-50"
        />
        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Unlock
        </button>
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-400">
            Back to library
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [links, setLinks] = useState<AppLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          setAuthenticated(true);
        }
      } catch {
        // not authenticated
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    async function init() {
      const data = await appService.getLinks();
      setLinks(data);
      setLoading(false);
    }
    init();
  }, [authenticated]);

  async function refreshLinks() {
    setLinks(await appService.getLinks());
  }

  async function handleAdd(url: string) {
    try {
      const res = await fetch("/api/fetch-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      let title: string;
      let iconUrl: string;

      if (res.ok) {
        const data = await res.json();
        title = data.title;
        iconUrl = data.iconUrl;
      } else {
        const hostname = new URL(url).hostname.replace("www.", "");
        title = hostname;
        iconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      }

      await appService.addLink({ url, title, iconUrl });
      await refreshLinks();
    } catch {
      const hostname = new URL(url).hostname.replace("www.", "");
      await appService.addLink({
        url,
        title: hostname,
        iconUrl: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      });
      await refreshLinks();
    }
  }

  async function handleUpdate(
    id: string,
    updates: Partial<Pick<AppLink, "title" | "iconUrl" | "customIcon">>
  ) {
    await appService.updateLink(id, updates);
    await refreshLinks();
  }

  async function handleDelete(id: string) {
    await appService.deleteLink(id);
    await refreshLinks();
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-indigo-500" />
      </div>
    );
  }

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center justify-center rounded-lg bg-gray-800/60 p-2 text-gray-400 ring-1 ring-white/10 transition-all hover:bg-gray-700/80 hover:text-white hover:ring-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Manage Apps
        </h1>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">
          Add New App
        </h2>
        <AdminLinkForm onAdd={handleAdd} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">
          Your Apps ({links.length})
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-indigo-500" />
          </div>
        ) : links.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            No apps added yet. Add a URL above to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <AdminLinkRow
                key={link.id}
                link={link}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
