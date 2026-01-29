import DataTable from '../DataTable';
import { fetcher } from '@/lib/coingecko.actions';
import { TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingCoinsFallback } from './fallback';

const TrendingCoins = async () => {
  let trendingCoins;
  try {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for testing
    trendingCoins = await fetcher<{ coins: TrendingCoin[] }>('search/trending', undefined, 300);
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return <TrendingCoinsFallback />;
  }

  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: 'Name',
      cellClassName: 'name-cell',
      cell: (coin) => {
        const item = coin.item;
        return (
          <Link href={`/coins/${item.id}`}>
            <Image src={item.large} alt={item.name} width={36} height={36} />
            <p>{item.name}</p>
          </Link>
        );
      },
    },
    {
      header: '24 change',
      cellClassName: 'name-cell',
      cell: (coin) => {
        const item = coin.item;
        const isTrendingUp = item.data.price_change_percentage_24h.usd > 0;
        return (
          <div className={cn('price-change', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
            <p className='flex items-center'>
              {formatPercentage(item.data.price_change_percentage_24h.usd)}
              {isTrendingUp ? (
                <TrendingUp width={16} height={16} />
              ) : (
                <TrendingDown width={16} height={16} />
              )}
              
            </p>
          </div>
        );
      },
    },
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (coin) => formatCurrency(coin.item.data.price),
    },
  ];
  return (
    <div id="trending-coins">
      <h4>Trending Coins</h4>
      <div className="trending-coin">
        <DataTable
          columns={columns}
          data={trendingCoins.coins.slice(0, 6) || []}
          rowKey={(coin, index) => coin.item.id}
          tableClassName="trending-coins-table"
          headerCellClassName="py-3!"
          bodyCellClassName="py-2!"
        />
      </div>
    </div>
  );
};

export default TrendingCoins;
