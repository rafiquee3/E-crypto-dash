import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { server } from '@/mocks/node';
import { delay, http, HttpResponse } from 'msw';
import { marketDataMock } from '@/mocks/data/marketDataMock';
import { AssetList } from '@/components/AssetList';
import QueryProvider from '@/providers/QueryProvider';
import { ReduxProvider } from '@/store/ReduxProvider';

it('should render the loading state and then the final list with header', async () => {
    server.use(
        http.get('/api/markets',  () => { 
            //await delay(800); 
            return HttpResponse.json(marketDataMock, { status: 200 });
        })
    );
  
    render (
        < ReduxProvider>
            <QueryProvider>
                <AssetList/>
            </QueryProvider>
        </ReduxProvider>
    );

    const loadingElement = screen.getByText(/Loading.../i); 
    expect(loadingElement).toBeInTheDocument();

    // @ts-ignore    
    const headerElement = await screen.findByText(/Bitcoin/i, { timeout: 3000 });
    expect(headerElement).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
});