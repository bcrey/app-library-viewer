import { appService } from "./appService";

const SEED_URLS = [
  "https://sight-reading-animals.vercel.app/",
  "https://apex-racer.vercel.app/",
  "https://circle-collide-game.vercel.app/",
  "https://pollski.app/",
  "https://www.takeabreath.site/",
];

export async function seedIfEmpty(): Promise<boolean> {
  const links = await appService.getLinks();
  if (links.length > 0) return false;

  const results = await Promise.allSettled(
    SEED_URLS.map(async (url) => {
      try {
        const res = await fetch("/api/fetch-meta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) throw new Error("Fetch failed");
        const { title, iconUrl } = await res.json();
        return { url, title, iconUrl };
      } catch {
        const hostname = new URL(url).hostname.replace("www.", "");
        return {
          url,
          title: hostname,
          iconUrl: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
        };
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      await appService.addLink(result.value);
    }
  }

  return true;
}
