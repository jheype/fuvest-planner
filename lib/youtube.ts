export type YtVideo = { label: string; url: string };

export function toYouTubeSearch(q: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export function isLikelyYouTubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ["www.youtube.com", "youtube.com", "youtu.be", "m.youtube.com"].includes(u.hostname);
  } catch {
    return false;
  }
}

export function isWatchUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return !!u.pathname.slice(1);
    }
    if (u.hostname.includes("youtube.com")) {
      return u.pathname === "/watch" && !!u.searchParams.get("v");
    }
    return false;
  } catch {
    return false;
  }
}

export function normalizeVideosToSearchIfBroken(videos: YtVideo[], query: string): YtVideo[] {
  return videos.map((v) => {
    if (!isLikelyYouTubeUrl(v.url) || !isWatchUrl(v.url)) {
      return { label: v.label, url: toYouTubeSearch(query) };
    }
    return v;
  });
}

export function dedupeLinks(list: YtVideo[]): YtVideo[] {
  const seen = new Set<string>();
  const out: YtVideo[] = [];
  for (const item of list) {
    const key = item.url.trim();
    if (!seen.has(key)) {
      out.push(item);
      seen.add(key);
    }
  }
  return out;
}
