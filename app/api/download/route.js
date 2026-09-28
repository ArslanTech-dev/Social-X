import { NextResponse } from "next/server";

/* ------------------------------------------------------------------
   Platform detection
   ------------------------------------------------------------------ */
function getPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com") || u.includes("vt.tiktok") || u.includes("vm.tiktok"))
    return "tiktok";
  if (u.includes("instagram.com") || u.includes("instagr.am"))
    return "instagram";
  if (u.includes("facebook.com") || u.includes("fb.watch") || u.includes("fb.com"))
    return "facebook";
  return null;
}

/* ------------------------------------------------------------------
   POST handler
   ------------------------------------------------------------------ */
export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    /* ---- Validate ---- */
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "URL zaroori hai." },
        { status: 400 }
      );
    }

    const platform = getPlatform(url);
    if (!platform) {
      return NextResponse.json(
        { success: false, message: "Sirf TikTok, Instagram aur Facebook support kiya jata hai." },
        { status: 400 }
      );
    }

    /* ================================================================
       TIKTOK  →  @tobyg74/tiktok-api-dl  (v1 = no watermark)
       ================================================================ */
    if (platform === "tiktok") {
      const mod = await import("@tobyg74/tiktok-api-dl");
      const Tiktok = mod.default || mod;

      const result = await Tiktok.Downloader(url, {
        version: "v1",
        showOriginalResponse: false,
      });

      if (result.status !== "success" || !result.result) {
        throw new Error(result.message || "TikTok video nahi mila.");
      }

      const data = result.result;

      let videoUrl = null;
      if (data.video?.playAddr?.length) videoUrl = data.video.playAddr[0];
      else if (data.video?.downloadAddr?.length) videoUrl = data.video.downloadAddr[0];

      if (!videoUrl) throw new Error("TikTok video URL extract nahi ho saka.");

      const thumbnail =
        data.video?.cover?.[0] ||
        data.cover?.[0] ||
        data.originCover?.[0] ||
        null;

      const title = data.desc || "TikTok Video";

      return NextResponse.json({
        success: true,
        platform: "tiktok",
        videoUrl,
        thumbnail,
        title,
        qualities: {
          hd: videoUrl,
          sd: videoUrl,
        },
      });
    }

    /* ================================================================
       INSTAGRAM  →  instagram-url-direct
       ================================================================ */
    if (platform === "instagram") {
      const mod = await import("instagram-url-direct");
      const instagramGetUrl = mod.default || mod;

      const data = await instagramGetUrl(url);

      if (!data?.media_details?.length) {
        throw new Error("Instagram media nahi mila. Post public hai?");
      }

      const videoItem = data.media_details.find((m) => m.type === "video");
      const target = videoItem || data.media_details[0];

      if (!target?.url) throw new Error("Instagram media URL extract nahi ho saka.");

      const thumbnail = target.thumbnail || null;
      const title = data.post_info?.owner_username
        ? `@${data.post_info.owner_username} – Instagram`
        : "Instagram Media";

      return NextResponse.json({
        success: true,
        platform: "instagram",
        videoUrl: target.url,
        thumbnail,
        title,
        qualities: {
          hd: target.url,
          sd: target.url,
        },
      });
    }

    /* ================================================================
       FACEBOOK  →  fb-downloader-scrapper
       ================================================================ */
    if (platform === "facebook") {
      const mod = await import("fb-downloader-scrapper");
      const getFbVideoInfo = mod.getFbVideoInfo || mod.default?.getFbVideoInfo;

      const data = await getFbVideoInfo(url);

      if (!data) throw new Error("Facebook video info nahi mili.");

      const hdUrl = data.hd || null;
      const sdUrl = data.sd || null;

      if (!hdUrl && !sdUrl) throw new Error("Facebook video URL extract nahi ho saka.");

      const thumbnail = data.thumbnail || null;
      const title = "Facebook Video";

      return NextResponse.json({
        success: true,
        platform: "facebook",
        videoUrl: hdUrl || sdUrl,
        thumbnail,
        title,
        qualities: {
          hd: hdUrl || sdUrl,
          sd: sdUrl || hdUrl,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Platform detect nahi ho saka." },
      { status: 400 }
    );
  } catch (err) {
    console.error("Download API error:", err);

    let message = "Video download nahi ho saka. Dobara koshish karo.";
    if (err.message?.includes("private")) message = "Yeh video private hai, download nahi ho sakti.";
    if (err.message?.includes("not found") || err.message?.includes("404"))
      message = "Video nahi mili. Link check karo.";
    if (err.message?.includes("rate") || err.message?.includes("limit"))
      message = "Bohat zyada requests. Thodi der baad try karo.";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}