import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import localFont from 'next/font/local';

const inter = localFont({
  src: '../public/fonts/Inter-VariableFont_opsz,wght.ttf',
  display: 'swap',
  variable: '--font-inter',
  weight: '100 200 300 400 500 600 700 800 900',
});

export const metadata: Metadata = {
  title: "Restaurant Rating App",
  description: "Frontend for Restaurant Rating App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body
        className={`antialiased`}
      >
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}