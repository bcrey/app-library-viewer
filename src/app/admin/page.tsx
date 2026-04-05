"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Loader2, Copy, Check, ClipboardPaste } from "lucide-react";
import Link from "next/link";
import { AppLink } from "@/types";
import { appService } from "@/lib/appService";
import AdminLinkForm from "@/components/AdminLinkForm";
import AdminLinkRow from "@/components/AdminLinkRow";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
    updates: Partial<
      Pick<AppLink, "title" | "iconUrl" | "customIcon" | "description" | "whatLearned">
    >
  ) {
    await appService.updateLink(id, updates);
    await refreshLinks();
  }

  async function handleDelete(id: string) {
    await appService.deleteLink(id);
    await refreshLinks();
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    setLinks(reordered);
    await appService.reorderLinks(reordered.map((l) => l.id));
  }

  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState("");

  function getExportJson() {
    return JSON.stringify(
      links.map(
        ({ url, title, iconUrl, customIcon, description, whatLearned, sortOrder }) => ({
          url,
          title,
          iconUrl,
          customIcon,
          description,
          whatLearned,
          sortOrder,
        })
      ),
      null,
      2
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getExportJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleImport() {
    setImportError("");
    setImportSuccess("");
    setImporting(true);
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) {
        setImportError("JSON must be an array of apps");
        setImporting(false);
        return;
      }
      let added = 0;
      for (const item of parsed) {
        if (!item.url || !item.title) {
          continue;
        }
        await appService.addLink({
          url: item.url,
          title: item.title,
          iconUrl:
            item.iconUrl ||
            `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=64`,
          description:
            typeof item.description === "string" ? item.description : undefined,
          whatLearned:
            typeof item.whatLearned === "string" ? item.whatLearned : undefined,
        });
        added++;
      }
      await refreshLinks();
      setImportJson("");
      setImportSuccess(`Imported ${added} app${added !== 1 ? "s" : ""}`);
      setTimeout(() => setImportSuccess(""), 3000);
    } catch {
      setImportError("Invalid JSON");
    } finally {
      setImporting(false);
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
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
            </SortableContext>
          </DndContext>
        )}
      </section>

      <section className="mt-10 border-t border-white/10 pt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">
          Export / Import
        </h2>

        <div className="space-y-4">
          {/* Export */}
          <div className="rounded-lg bg-gray-800/40 p-4 ring-1 ring-white/10">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-300">
                Copy all apps as JSON
              </p>
              <button
                onClick={handleCopy}
                disabled={links.length === 0}
                className="flex items-center gap-1.5 rounded-md bg-gray-700/60 px-3 py-1.5 text-xs font-medium text-gray-200 ring-1 ring-white/10 transition-all hover:bg-gray-600/80 hover:text-white disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="max-h-48 overflow-auto rounded-md bg-gray-900/80 p-3 text-xs text-gray-400">
              {links.length > 0
                ? getExportJson()
                : "No apps to export"}
            </pre>
          </div>

          {/* Import */}
          <div className="rounded-lg bg-gray-800/40 p-4 ring-1 ring-white/10">
            <p className="mb-2 text-sm text-gray-300">
              Paste JSON to import apps
            </p>
            <textarea
              value={importJson}
              onChange={(e) => {
                setImportJson(e.target.value);
                setImportError("");
              }}
              placeholder='Paste JSON array here...'
              rows={4}
              className="w-full rounded-md bg-gray-900/80 px-3 py-2 text-xs text-gray-300 placeholder-gray-600 ring-1 ring-white/10 transition-all focus:outline-none focus:ring-indigo-500/50"
            />
            {importError && (
              <p className="mt-1 text-xs text-red-400">{importError}</p>
            )}
            {importSuccess && (
              <p className="mt-1 text-xs text-green-400">{importSuccess}</p>
            )}
            <button
              onClick={handleImport}
              disabled={!importJson.trim() || importing}
              className="mt-2 flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
            >
              {importing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ClipboardPaste className="h-3.5 w-3.5" />
              )}
              Import Apps
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
