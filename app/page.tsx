import CoinOverview from '@/components/home/CoinOverview';
import TrendingCoins from '@/components/home/TrendingCoins';
import {
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from '@/components/home/fallback';
import { Suspense } from 'react';

const page = () => {
  return (
    <main className="main-container">
      <section className="home-grid">
        <Suspense fallback={<CoinOverviewFallback />}>
          <CoinOverview />
        </Suspense>
        <Suspense fallback={<TrendingCoinsFallback />}>
          <TrendingCoins />
        </Suspense>
      </section>

      <section className="w-full mt-7 space-y-4">
        <h4>Categories</h4>
      </section>
    </main>
  );
};

export default page;
