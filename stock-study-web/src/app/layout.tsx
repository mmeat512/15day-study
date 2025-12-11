import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

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
    default: "StockStudy - 15일 주식 공부 트래커",
    template: "%s | StockStudy",
  },
  description:
    "15일 동안 체계적으로 주식 투자를 학습하는 스터디 트래킹 플랫폼. 과제 제출, 진행률 추적, 커뮤니티 학습을 통해 주식 투자의 기초를 완성하세요.",
  keywords: [
    "주식 공부",
    "주식 투자",
    "재테크",
    "금융 교육",
    "스터디",
    "학습 트래커",
    "투자 교육",
    "주식 입문",
  ],
  authors: [{ name: "StockStudy Team" }],
  creator: "StockStudy Team",
  publisher: "StockStudy",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3090"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "StockStudy - 15일 주식 공부 트래커",
    description:
      "15일 동안 체계적으로 주식 투자를 학습하는 스터디 트래킹 플랫폼",
    siteName: "StockStudy",
    images: [
      {
        url: "/opengraph-image.svg",
        width: 1200,
        height: 630,
        alt: "StockStudy - 15일 주식 공부 트래커",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StockStudy - 15일 주식 공부 트래커",
    description:
      "15일 동안 체계적으로 주식 투자를 학습하는 스터디 트래킹 플랫폼",
    images: ["/opengraph-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#048CFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
