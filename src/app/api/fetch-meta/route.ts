import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    let html = "";
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      clearTimeout(timeout);
      html = await res.text();
    } catch {
      // If fetch fails, return fallback data
      return NextResponse.json({
        title: parsedUrl.hostname.replace("www.", ""),
        iconUrl: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`,
      });
    }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].trim().replace(/\s+/g, " ")
      : parsedUrl.hostname.replace("www.", "");

    // Extract favicon
    let iconUrl = "";
    const iconPatterns = [
      /<link[^>]*rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]*\/?>/gi,
    ];

    for (const pattern of iconPatterns) {
      const match = pattern.exec(html);
      if (match?.[1]) {
        iconUrl = match[1];
        break;
      }
    }

    if (iconUrl) {
      // Resolve relative URLs
      try {
        iconUrl = new URL(iconUrl, url).toString();
      } catch {
        iconUrl = "";
      }
    }

    // Fallback to Google Favicons service
    if (!iconUrl) {
      iconUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
    }

    return NextResponse.json({ title, iconUrl });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
