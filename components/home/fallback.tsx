import DataTable from '../DataTable';

export const CoinOverviewFallback = () => {
  return (
    <div id="coin-overview-fallback">
      <div className="header pt-2">
        <div className="header-image skeleton animate-pulse" />
        <div className="info">
          <div className="header-line-sm skeleton animate-pulse rounded" />
          <div className="header-line-lg skeleton animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
};

const skeletonColumns: DataTableColumn<number>[] = [
  {
    header: 'Name',
    cellClassName: 'name-cell',
    cell: () => (
      <div className="name-link">
        <div className="name-image skeleton animate-pulse" />
        <div className="name-line skeleton animate-pulse rounded" />
      </div>
    ),
  },
  {
    header: '24 change',
    cellClassName: 'change-cell',
    cell: () => (
      <div className="price-change">
        <div className="change-icon skeleton animate-pulse" />
        <div className="change-line skeleton animate-pulse rounded" />
      </div>
    ),
  },
  {
    header: 'Price',
    cellClassName: 'price-cell',
    cell: () => <div className="price-line skeleton animate-pulse rounded" />,
  },
];

const skeletonData = [1, 2, 3, 4, 5, 6];

export const TrendingCoinsFallback = () => {
  return (
    <div id="trending-coins-fallback">
      <h4>Trending Coins</h4>
      <DataTable
        columns={skeletonColumns}
        data={skeletonData}
        rowKey={(_, index) => index}
        tableClassName="trending-coins-table"
        headerCellClassName="py-3!"
        bodyCellClassName="py-2!"
      />
    </div>
  );
};
