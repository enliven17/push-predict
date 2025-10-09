/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/markets/[id]/page.tsx
import { Metadata } from 'next';
import MarketDetailPage from '@/components/market/market-detail-page';
import { MarketCategory } from '@/types/market';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const marketId = resolvedParams.id;

  // Basic metadata since we can't fetch market data server-side with contract hooks
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/markets/${marketId}`;

  return {
    title: `Market ${marketId}`,
    description: 'View and trade on this universal cross-chain prediction market powered by Push Network',
    openGraph: {
      title: `Market ${marketId} | PushPredict`,
      description: 'View and trade on this universal cross-chain prediction market powered by Push Network',
      url: canonicalUrl,
      siteName: 'PushPredict',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Market ${marketId} | PushPredict`,
      description: 'View and trade on this universal cross-chain prediction market powered by Push Network',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <MarketDetailPage />;
}