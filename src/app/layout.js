import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Scheme Finder — Quick Scheme & LOA Lookup",
  description: "Fast, offline Scheme Finder to search scheme names and view details (Scheme ID, LOA number, Block, JE Name). Responsive dark-mode UI with copy-to-clipboard.",
  openGraph: {
    title: "Scheme Finder — Quick Scheme & LOA Lookup",
    description: "Fast, offline Scheme Finder to search scheme names and view details (Scheme ID, LOA number, Block, JE Name).",
    siteName: "Scheme Finder",
  },
  themeColor: '#181c24',
  icons: {
    icon: '/file.svg',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
