import { render, screen } from '@testing-library/react';
import { server } from '../src/mocks/node';
import { http, HttpResponse } from 'msw';
import { marketDataMock } from '../src/mocks/data/marketDataMock';
import { AssetList } from '@/src/components/AssetList';

describe('Asset List Component', () => {
    it('should render a loading state and then display the asset list', async () => {
        server.use(
            http.get('https://api.coingecko.com/api/v3/coins/markets', () => {
                return HttpResponse.json(marketDataMock, { status: 200 });
            })
        );

        render(<AssetList/>);

        const firstAssetElement = await screen.findByText(/Bitcoin/i);
        expect(firstAssetElement).toBeInTheDocument();

        const allAssets = await screen.findAllByRole('listitem');
        expect(allAssets.length).toBe(marketDataMock.length);
    })
})










