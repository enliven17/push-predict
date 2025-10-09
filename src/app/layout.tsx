import { ErrorBoundary } from "@/components/shared/error-bounday";
import { headers } from "next/headers";
import { Header } from "@/components/shared/header";
import { TermsGuard } from "@/components/shared/terms-guard";
import { Web3Provider } from "@/providers/web3-provider";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/shared/footer";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"] });

// Global Metadata
export const metadata = {
  title: {
    default: "PushPredict – Universal Cross-Chain Prediction Markets",
    template: "%s | PushPredict",
  },
  description:
    "Trade, predict, and win on PushPredict. Universal cross-chain prediction markets powered by Push Network's revolutionary technology.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "PushPredict – Universal Cross-Chain Prediction Markets",
    description:
      "Trade, predict, and win on PushPredict. Universal cross-chain, transparent, and community-driven prediction markets.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "PushPredict",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "PushPredict",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PushPredict – Universal Cross-Chain Prediction Markets",
    description:
      "Trade, predict, and win on PushPredict. Universal cross-chain, transparent, and community-driven.",
    creator: "@pushpredict",
    images: [],
  },
  icons: undefined,
  manifest: "/site.webmanifest",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.className} bg-gradient-to-r from-[#0A0C14] via-[#1A1F2C] to-[#0A0C14]`}
      >
        <ErrorBoundary>
          <Web3Provider>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0A0C14] via-[#1A1F2C] to-[#2D1B3D] text-white relative">
              {/* Push Network gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <TermsGuard>
                <Header />
                <main className="flex-1 relative z-10">{children}</main>
                {pathname === "/" && <Footer />}
              </TermsGuard>
            </div>
            <Toaster theme="dark" position="top-right" />
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}