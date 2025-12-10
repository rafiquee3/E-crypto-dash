import { fetchMarketlData } from "@/src/services/cryptoService";

export default async function handler(req, res) {
    try {
        const params = req.query;
        const data = await fetchMarketlData(params); 

        res.status(200).json(data);
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch external data.' });
    }
}