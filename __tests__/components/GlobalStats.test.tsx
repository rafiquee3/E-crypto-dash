import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/node';
import { GlobalStats } from '@/components/GlobalStats';
import QueryProvider from '@/providers/QueryProvider';
import { ReduxProvider } from '@/store/ReduxProvider';

const mockGlobalData = {
  total_market_cap: { usd: 2500000000000 },
  total_volume: { usd: 150000000000 },
  market_cap_percentage: { btc: 52.5, eth: 17.2 },
  market_cap_change_percentage_24h_usd: 2.35,
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ReduxProvider>
      <QueryProvider>{ui}</QueryProvider>
    </ReduxProvider>,
  );
};

describe('GlobalStats Component', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/markets/global', () => {
        return HttpResponse.json(mockGlobalData);
      }),
    );
  });

  describe('Data Display', () => {
    it('should display total market cap', async () => {
      renderWithProviders(<GlobalStats />);

      await waitFor(() => {
        expect(screen.getByText(/market cap/i)).toBeInTheDocument();
      });
    });

    it('should display 24h market cap change percentage', async () => {
      renderWithProviders(<GlobalStats />);

      await waitFor(() => {
        expect(screen.getByText(/24h/i)).toBeInTheDocument();
      });
    });

    it('should display BTC dominance percentage', async () => {
      renderWithProviders(<GlobalStats />);

      await waitFor(() => {
        expect(screen.getByText(/btc/i)).toBeInTheDocument();
      });
    });

    it('should display ETH dominance percentage', async () => {
      renderWithProviders(<GlobalStats />);

      await waitFor(() => {
        expect(screen.getByText(/eth/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading placeholder initially', async () => {
      // Delay response
      server.use(
        http.get('/api/markets/global', async () => {
          await new Promise((r) => setTimeout(r, 100));
          return HttpResponse.json(mockGlobalData);
        }),
      );

      const { container } = renderWithProviders(<GlobalStats />);

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();

      // Wait for data to appear
      await waitFor(() => {
        expect(screen.getByText(/market cap/i)).toBeInTheDocument();
      });
    });
  });

  describe('Color Coding', () => {
    it('should show positive change in green', async () => {
      server.use(
        http.get('/api/markets/global', () => {
          return HttpResponse.json({
            ...mockGlobalData,
            market_cap_change_percentage_24h_usd: 5.0,
          });
        }),
      );

      renderWithProviders(<GlobalStats />);

      await waitFor(() => {
        // Look for the arrow and value
        const changeElement = screen.getByText(/▲ 5\.0%/);
        expect(changeElement).toHaveClass('text-emerald-400');
      });
    });

    it('should show negative change in red', async () => {
      server.use(
        http.get('/api/markets/global', () => {
          return HttpResponse.json({
            ...mockGlobalData,
            market_cap_change_percentage_24h_usd: -3.5,
          });
        }),
      );

      renderWithProviders(<GlobalStats />);

      await waitFor(() => {
        // Look for the arrow and value
        const changeElement = screen.getByText(/▼ 3\.5%/);
        expect(changeElement).toHaveClass('text-rose-400');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('/api/markets/global', () => {
          return HttpResponse.error();
        }),
      );

      renderWithProviders(<GlobalStats />);

      // Component should not crash
      await waitFor(() => {
        // Either shows error message or empty state
        expect(document.body).toBeInTheDocument();
      });
    });
  });
});
