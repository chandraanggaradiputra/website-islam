import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateOrganizationSchema } from '@/lib/schema';
import clsx from 'clsx';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Banten Mengaji | Direktori Masjid & Jadwal Kajian Sunnah Banten",
    template: "%s - Banten Mengaji",
  },
  description: "Pusat informasi jadwal kajian Islam ilmiah bermanhaj Salafus Shalih dan direktori masjid di seluruh Provinsi Banten.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://maschandigital.id'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateOrganizationSchema();

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className={clsx('flex', 'flex-col', 'bg-slate-50', 'dark:bg-slate-950', 'min-h-full', 'text-slate-900', 'dark:text-slate-100', 'transition-colors', 'duration-200')}>
        <JsonLd data={orgSchema} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className={clsx('flex-grow', 'mx-auto', 'px-4', 'py-8', 'pb-20', 'md:pb-0', 'container')}>
            {children}
          </main>
          <BottomNav />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
