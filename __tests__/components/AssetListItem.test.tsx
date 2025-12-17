import { render, screen } from '@testing-library/react';
import { AssetListItem } from '@/components/AssetListItem';
import { MarketDataFrontMock } from '@/mocks/data/marketDataMock';
import { CoinMarketData } from '@/types/yup';

type TestableNumericFields = {
  current_price: null | string | number;
  total_volume: null | string | number;
  market_cap: null | string | number;
  price_change_percentage_1h_in_currency: null | string | number;
  price_change_percentage_24h_in_currency: null | string | number;
  price_change_percentage_7d_in_currency: null | string | number;
};

describe('AssetListItem', () => {
  const baseMarketData = MarketDataFrontMock[0];

  const renderItem = (overrides: Partial<TestableNumericFields> = {}, currency = 'usd') => {
    const marketData = { ...baseMarketData, ...overrides } as CoinMarketData;

    return render(
      <table>
        <tbody>
          <AssetListItem marketData={marketData} currency={currency} />
        </tbody>
      </table>
    );
  };

  it('renders basic data: rank, name and symbol', () => {
    renderItem();

    expect(screen.getByText(String(baseMarketData.market_cap_rank))).toBeInTheDocument();
    expect(screen.getByText(baseMarketData.name)).toBeInTheDocument();
    expect(screen.getByText(baseMarketData.symbol)).toBeInTheDocument();
  });

  it('formats the price as a currency value with the correct prefix', () => {
    renderItem({}, 'usd');

    expect(screen.getByText(/\$/i)).toBeInTheDocument();
  });

  it('formats large numbers (volume, market cap) to a shortened form', () => {
    renderItem();
    screen.debug()
    expect(screen.getAllByText(/B|M|T/i, { exact: false })[0]).toBeInTheDocument();
  });

  it('displays "N/A" for missing numeric values', () => {
    renderItem({
      current_price: null,
      total_volume: null,
      market_cap: null,
      price_change_percentage_1h_in_currency: null,
      price_change_percentage_24h_in_currency: null,
      price_change_percentage_7d_in_currency: null,
    });

    const naElements = screen.getAllByText('N/A');
    expect(naElements.length).toBeGreaterThan(0);
  });
});


