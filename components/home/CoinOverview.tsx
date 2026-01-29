import { fetcher } from '@/lib/coingecko.actions';
import { cn, formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { CoinOverviewFallback } from './fallback';
import CandleStickChart from '../CandleStickChart';

const CoinOverview = async () => {
    try{
      // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for testing
      const [coin, coinOHLCData] = await Promise.all([
        fetcher<CoinDetailsData>(`coins/bitcoin`, {
          dex_pair_format: 'symbol'
        }),
        fetcher<OHLCData[]>(`coins/bitcoin/ohlc`, {
          vs_currency: 'usd',
          days: 1,
          precision: 'full'
        })
      ]);

      return (
        <div id='coin-overview'>
          <CandleStickChart data={coinOHLCData} coinId='bitcoin' >
            <div className='header pt-2'>
              <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
              <div className='info'>
                <p>{coin.name} / {coin.symbol.toLocaleUpperCase()}</p>
                <h1>{formatCurrency (coin.market_data.current_price.usd)}</h1>
              </div>
            </div>
          </CandleStickChart>
        </div>
      );
    } catch (error) {
      console.error('Error fetching coin data:', error);
      return <CoinOverviewFallback />;
    }
    


    
}

export default CoinOverview