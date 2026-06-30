import type { Metadata } from "next";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = getDictionary(locale);

  return (
    <html lang={locale} className={`${inter.variable} ${nanumPenScript.variable}`}>
      <body className="min-h-screen bg-canvas font-sans text-foreground antialiased">
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
