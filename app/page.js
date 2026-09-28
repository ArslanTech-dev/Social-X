"use client";

import { useState, useCallback } from "react";

/* ------------------------------------------------------------------
   Platform detection helper
   ------------------------------------------------------------------ */
function detectPlatform(url) {
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
   Platform icons (inline SVG)
   ------------------------------------------------------------------ */
const PlatformIcon = ({ platform }) => {
  if (platform === "tiktok")
    return (
      <span className="inline-flex items-center gap-1.5 text-pink-400 font-semibold text-sm">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z" />
        </svg>
        TikTok
      </span>
    );
  if (platform === "instagram")
    return (
      <span className="inline-flex items-center gap-1.5 text-purple-400 font-semibold text-sm">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
        Instagram
      </span>
    );
  if (platform === "facebook")
    return (
      <span className="inline-flex items-center gap-1.5 text-blue-400 font-semibold text-sm">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </span>
    );
  return null;
};

/* ------------------------------------------------------------------
   Main page component
   ------------------------------------------------------------------ */
export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("hd");

  const detectedPlatform = detectPlatform(url);

  /* ---- API call ---- */
  const handleDownload = useCallback(async () => {
    if (!url.trim()) {
      setError("Pehle link paste karo!");
      return;
    }
    if (!detectedPlatform) {
      setError("Sirf TikTok, Instagram ya Facebook ka link support kiya jata hai.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Download link nahi mila. Dobara koshish karo.");
      }

      setResult(data);
      setSelectedQuality(data.qualities?.hd ? "hd" : "sd");
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  }, [url, detectedPlatform]);

  /* ---- Final download trigger ---- */
  const handleFinalDownload = () => {
    if (!result) return;
    const link =
      selectedQuality === "hd" && result.qualities?.hd
        ? result.qualities.hd
        : result.qualities?.sd || result.qualities?.default;

    if (link) {
      const a = document.createElement("a");
      a.href = link;
      a.download = `${result.title || "video"}.mp4`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f] flex flex-col">
      {/* ============ HEADER ============ */}
      <header className="w-full py-5 px-4 border-b border-purple-900/40 bg-black/30 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2">
          <span className="text-2xl">⚡</span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            ARSLAN TECH&apos;S
          </h1>
          <span className="text-gray-400 text-sm sm:text-base font-medium hidden sm:inline">
            — Social Downloader
          </span>
        </div>
      </header>

      {/* ============ MAIN CARD ============ */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl">
          <div className="bg-[#12121a]/80 backdrop-blur-xl border border-purple-800/30 rounded-2xl p-5 sm:p-8 shadow-[0_0_60px_-15px_rgba(168,85,247,0.3)]">
            {/* Input area */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  placeholder="Yahan TikTok / Insta / FB ka link paste karo..."
                  className="w-full bg-[#1a1a2e] border border-purple-800/40 rounded-xl px-4 py-3.5 pr-24 text-sm sm:text-base text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                  disabled={loading}
                />
                {detectedPlatform && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <PlatformIcon platform={detectedPlatform} />
                  </div>
                )}
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={loading || !url.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-purple-900/40 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Video dhoondh rahe hain...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* ============ PREVIEW SECTION ============ */}
            {result && (
              <div className="mt-6 space-y-4 border-t border-purple-800/30 pt-6">
                <div className="flex gap-4 items-start">
                  {result.thumbnail && (
                    <img
                      src={result.thumbnail}
                      alt="Video thumbnail"
                      className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-lg border border-purple-800/40 flex-shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm sm:text-base line-clamp-3">
                      {result.title || "Untitled Video"}
                    </p>
                    <div className="mt-2">
                      <PlatformIcon platform={result.platform} />
                    </div>
                  </div>
                </div>

                {/* Quality selector */}
                <div className="flex gap-2">
                  {result.qualities?.hd && (
                    <button
                      onClick={() => setSelectedQuality("hd")}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        selectedQuality === "hd"
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                          : "bg-[#1a1a2e] text-gray-400 border border-purple-800/30 hover:border-purple-600"
                      }`}
                    >
                      HD (Bina Watermark)
                    </button>
                  )}
                  {result.qualities?.sd && (
                    <button
                      onClick={() => setSelectedQuality("sd")}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        selectedQuality === "sd"
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                          : "bg-[#1a1a2e] text-gray-400 border border-purple-800/30 hover:border-purple-600"
                      }`}
                    >
                      SD
                    </button>
                  )}
                </div>

                {/* Final download button */}
                <button
                  onClick={handleFinalDownload}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-emerald-900/40 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Final Download ({selectedQuality.toUpperCase()})
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-gray-600 text-xs mt-6">
            © {new Date().getFullYear()} ARSLAN TECH. Sabhi platforms ke videos bina watermark download karo.
          </p>
        </div>
      </main>
    </div>
  );
}