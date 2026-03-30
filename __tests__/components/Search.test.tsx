import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from '@/components/Search';
import { ReduxProvider } from '@/store/ReduxProvider';
import { useCoinSearch } from '@/hooks/useCoinSearch';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/useCoinSearch');
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockUseCoinSearch = useCoinSearch as jest.MockedFunction<typeof useCoinSearch>;

const renderSearch = () => {
  return render(
    <ReduxProvider>
      <Search />
    </ReduxProvider>,
  );
};

describe('Search Component', () => {
  const user = userEvent.setup({ delay: null });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCoinSearch.mockReturnValue({
      data: {
        coins: [
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', thumb: '/btc.png', market_cap_rank: 1 },
          {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'ETH',
            thumb: '/eth.png',
            market_cap_rank: 2,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
    } as any);
  });

  it('renders search input correctly', () => {
    renderSearch();
    expect(screen.getByPlaceholderText(/Search coins\.\.\./i)).toBeInTheDocument();
  });

  it('displays search results when typing', async () => {
    renderSearch();
    const input = screen.getByRole('textbox');

    await user.type(input, 'bit');

    // Wait for debounce and re-render
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });
  });

  it('navigates to coin page on result click', async () => {
    renderSearch();
    const input = screen.getByRole('textbox');
    await user.type(input, 'bit');

    const result = await screen.findByText('Bitcoin');
    await user.click(result);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('bitcoin'));
  });

  it('shows empty state message when no results', async () => {
    mockUseCoinSearch.mockReturnValue({
      data: { coins: [] },
      isLoading: false,
      isFetching: false,
    } as any);
    renderSearch();
    const input = screen.getByRole('textbox');
    await user.type(input, 'xyz');

    await waitFor(() => {
      expect(screen.getByText(/No coins found for/i)).toBeInTheDocument();
    });
  });

  it('closes dropdown on Escape key', async () => {
    renderSearch();
    const input = screen.getByRole('textbox');
    await user.type(input, 'bit');

    expect(await screen.findByText('Bitcoin')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    });
  });

  it('manages keyboard focus (ArrowDown/ArrowUp)', async () => {
    renderSearch();
    const input = screen.getByRole('textbox');
    await user.type(input, 'bit');

    expect(await screen.findByText('Bitcoin')).toBeInTheDocument();

    // ArrowDown should highlight the first result
    await user.keyboard('{ArrowDown}');
    const options = screen.getAllByRole('option');
    const button = options[0].querySelector('button');
    expect(button).toHaveClass('bg-white/10');

    // Enter should select the highlighted result
    await user.keyboard('{Enter}');
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('bitcoin'));
  });
});
