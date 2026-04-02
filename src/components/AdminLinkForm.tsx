"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

interface AdminLinkFormProps {
  onAdd: (url: string) => Promise<void>;
}

export default function AdminLinkForm({ onAdd }: AdminLinkFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    // Auto-prepend https:// if no protocol
    let fullUrl = trimmed;
    if (!fullUrl.match(/^https?:\/\//)) {
      fullUrl = `https://${fullUrl}`;
    }

    try {
      new URL(fullUrl);
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      await onAdd(fullUrl);
      setUrl("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter a URL (e.g. example.com)"
        disabled={loading}
        className="flex-1 rounded-lg bg-gray-800/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 ring-1 ring-white/10 transition-all focus:outline-none focus:ring-indigo-500/50 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add
      </button>
    </form>
  );
}
