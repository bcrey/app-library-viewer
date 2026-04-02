"use client";

import { AppLink } from "@/types";
import AppCard from "./AppCard";

interface AppGridProps {
  links: AppLink[];
}

export default function AppGrid({ links }: AppGridProps) {
  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-32 text-gray-500">
        <p className="text-lg">No apps yet</p>
        <p className="text-sm">Go to the admin page to add some links</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {links.map((link) => (
        <AppCard key={link.id} link={link} />
      ))}
    </div>
  );
}
