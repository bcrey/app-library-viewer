"use client";

import { useState } from "react";
import {
  Trash2,
  ExternalLink,
  Check,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppLink } from "@/types";
import ImageUpload from "./ImageUpload";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AdminLinkRowProps {
  link: AppLink;
  onUpdate: (
    id: string,
    updates: Partial<
      Pick<AppLink, "title" | "iconUrl" | "customIcon" | "description" | "whatLearned">
    >
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AdminLinkRow({ link, onUpdate, onDelete }: AdminLinkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editDescription, setEditDescription] = useState(link.description ?? "");
  const [editWhatLearned, setEditWhatLearned] = useState(link.whatLearned ?? "");
  const [savingDetails, setSavingDetails] = useState(false);
  const [savedDetails, setSavedDetails] = useState(false);

  function handleSaveTitle() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== link.title) {
      onUpdate(link.id, { title: trimmed });
    }
    setEditing(false);
  }

  async function handleSaveDetails() {
    const nextDescription = editDescription.trim();
    const nextWhatLearned = editWhatLearned.trim();
    const updates: Partial<Pick<AppLink, "description" | "whatLearned">> = {};
    if (nextDescription !== (link.description ?? "")) {
      updates.description = nextDescription;
    }
    if (nextWhatLearned !== (link.whatLearned ?? "")) {
      updates.whatLearned = nextWhatLearned;
    }
    if (Object.keys(updates).length === 0) return;
    setSavingDetails(true);
    try {
      await onUpdate(link.id, updates);
      setSavedDetails(true);
      setTimeout(() => setSavedDetails(false), 1500);
    } finally {
      setSavingDetails(false);
    }
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(link.id);
  }

  function handleUpload(base64: string) {
    onUpdate(link.id, { iconUrl: base64, customIcon: true });
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasDetails = !!(link.description || link.whatLearned);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col rounded-xl bg-gray-800/40 ring-1 ring-white/[0.06] ${
        isDragging ? "relative z-50 opacity-80 shadow-2xl shadow-black/50 ring-indigo-500/30" : ""
      }`}
    >
      <div className="flex items-center gap-4 px-4 py-3">
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab touch-none text-gray-600 hover:text-gray-400 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <ImageUpload currentIcon={link.iconUrl} onUpload={handleUpload} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") setEditing(false);
              }}
              autoFocus
              className="flex-1 rounded bg-gray-700/60 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
            <button onClick={handleSaveTitle} className="text-green-400 hover:text-green-300">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditTitle(link.title);
              setEditing(true);
            }}
            className="truncate text-left text-sm font-medium text-white hover:text-indigo-300"
            title="Click to edit title"
          >
            {link.title}
          </button>
        )}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 truncate text-xs text-gray-500 hover:text-gray-400"
        >
          {link.url}
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className={`flex-shrink-0 rounded-lg p-2 transition-all ${
          expanded
            ? "bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/30"
            : hasDetails
            ? "text-indigo-400 hover:bg-gray-700/50 hover:text-indigo-300"
            : "text-gray-500 hover:bg-gray-700/50 hover:text-gray-300"
        }`}
        title={expanded ? "Hide details" : "Edit description & notes"}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={handleDelete}
        className={`flex-shrink-0 rounded-lg p-2 transition-all ${
          confirmDelete
            ? "bg-red-600/20 text-red-400 ring-1 ring-red-500/30"
            : "text-gray-500 hover:bg-gray-700/50 hover:text-red-400"
        }`}
        title={confirmDelete ? "Click again to confirm" : "Delete"}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-400">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="What does this app do? (optional)"
              rows={2}
              className="w-full resize-y rounded-md bg-gray-900/60 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 ring-1 ring-white/10 transition-all focus:outline-none focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-400">
              What I learned
            </label>
            <textarea
              value={editWhatLearned}
              onChange={(e) => setEditWhatLearned(e.target.value)}
              placeholder="Takeaways from building this (optional)"
              rows={3}
              className="w-full resize-y rounded-md bg-gray-900/60 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 ring-1 ring-white/10 transition-all focus:outline-none focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            {savedDetails && (
              <span className="text-xs text-green-400">Saved</span>
            )}
            <button
              onClick={handleSaveDetails}
              disabled={
                savingDetails ||
                (editDescription.trim() === (link.description ?? "") &&
                  editWhatLearned.trim() === (link.whatLearned ?? ""))
              }
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
            >
              {savingDetails ? "Saving…" : "Save details"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
