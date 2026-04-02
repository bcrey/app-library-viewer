"use client";

import { AppLink } from "@/types";

interface AppCardProps {
  link: AppLink;
}

export default function AppCard({ link }: AppCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex aspect-[2/1] items-center gap-4 rounded-2xl bg-gray-800/50 px-5
        ring-1 ring-white/[0.08] backdrop-blur-sm
        transition-all duration-300 ease-out
        hover:scale-[1.04] hover:bg-gray-800/80 hover:ring-white/20
        hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]
        active:scale-[1.01]"
    >
      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-700/50 p-2 transition-all duration-300 group-hover:bg-gray-700/80 group-hover:shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={link.iconUrl}
          alt={link.title}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = "1";
              try {
                const hostname = new URL(link.url).hostname;
                img.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
              } catch {
                img.style.display = "none";
              }
            }
          }}
        />
      </div>
      <span className="min-w-0 truncate text-base font-semibold text-gray-300 transition-colors duration-300 group-hover:text-white">
        {link.title}
      </span>
    </a>
  );
}
