import "./globals.css";

export const metadata = {
  title: "ARSLAN TECH'S - Social Downloader",
  description:
    "Download videos from TikTok, Instagram, and Facebook without watermark. Free, fast, and no login required.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}