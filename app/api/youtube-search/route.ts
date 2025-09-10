import { NextRequest, NextResponse } from "next/server";

type YtItem = { label: string; url: string };

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Unknown error";
}

export async function POST(req: NextRequest) {
  try {
    const { q, max = 3 } = (await req.json()) as { q: string; max?: number };
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      return NextResponse.json({ items: [] as YtItem[] });
    }

    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      q,
      maxResults: String(Math.min(Math.max(max, 1), 5)),
      key,
      safeSearch: "moderate",
    });

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ items: [] as YtItem[], error: `YouTube API ${res.status}` }, { status: 200 });
    }
    const data = await res.json();
    const items: YtItem[] = (data.items || []).map((it: any) => ({
      label: `${it.snippet?.title ?? "YouTube"}`,
      url: `https://www.youtube.com/watch?v=${it.id?.videoId}`,
    }));
    return NextResponse.json({ items });
  } catch (err: unknown) {
    return NextResponse.json({ items: [] as YtItem[], error: getErrorMessage(err) }, { status: 200 });
  }
}
