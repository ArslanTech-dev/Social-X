import { NextResponse } from "next/server";

// Lightweight proxy/stream endpoint
// Usage: GET /api/stream?url=<encoded_video_url>
// This fetches the remote video URL and streams it back with an attachment header

export async function GET(request) {
  try {
    const reqUrl = new URL(request.url);
    const url = reqUrl.searchParams.get("url");

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, message: "URL zaroori hai." }, { status: 400 });
    }

    // Basic validation
    try {
      new URL(url);
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid URL." }, { status: 400 });
    }

    // Fetch the remote resource. Add a User-Agent to improve compatibility.
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ArslanTech-SocialDownloader/1.0 (+https://arslantech.dev)"
      },
      // don't use cached response from serverless layer
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, message: `Remote fetch failed (${res.status}).` }, { status: 502 });
    }

    // Prepare headers for the streamed response
    const headers = new Headers();
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const contentLength = res.headers.get("content-length");

    headers.set("Content-Type", contentType);
    if (contentLength) headers.set("Content-Length", contentLength);

    // Force download in browser
    headers.set("Content-Disposition", `attachment; filename="video.mp4"`);

    // Allow the browser to fetch the stream from a different origin (if frontend hosted elsewhere)
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");

    return new Response(res.body, { status: 200, headers });
  } catch (err) {
    console.error("Stream API error:", err);
    return NextResponse.json({ success: false, message: "Video stream nahi ho saka. Dobara koshish karo." }, { status: 500 });
  }
}
