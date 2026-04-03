"use client";

import { useState } from "react";
import { Trash2, ExternalLink, Check, X, GripVertical } from "lucide-react";
import { AppLink } from "@/types";
import ImageUpload from "./ImageUpload";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AdminLinkRowProps {
  link: AppLink;
  onUpdate: (id: string, updates: Partial<Pick<AppLink, "title" | "iconUrl" | "customIcon">>) => Promise<void>;
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

  function handleSaveTitle() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== link.title) {
      onUpdate(link.id, { title: trimmed });
    }
    setEditing(false);
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-xl bg-gray-800/40 px-4 py-3 ring-1 ring-white/[0.06] ${
        isDragging ? "relative z-50 opacity-80 shadow-2xl shadow-black/50 ring-indigo-500/30" : ""
      }`}
    >
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
  );
}
