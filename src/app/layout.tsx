import type { Metadata, Viewport } from "next";
import { Inter, Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const nanumPenScript = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "lendly.",
  description: "Internal loan tracking",
};

// Lock zoom on iOS: prevents pinch / double-tap zoom, and combined with the
// 16px input font in globals.css stops Safari's auto-zoom when focusing fields.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${nanumPenScript.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-canvas font-sans text-foreground antialiased">
        {/* Apply the saved theme before paint to avoid a light/dark flash.
            The accent color is user-specific and injected server-side in the
            authenticated layout, so it isn't handled here. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);}else{d.removeAttribute('data-theme');}}catch(e){}})();`,
          }}
        />
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
