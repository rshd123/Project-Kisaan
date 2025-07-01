import express from 'express';
import scrapeAgmarknetPrices from '../utils/scrapeAgmarknet.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { state, market, commodity } = req.query;

  if (!state || !market || !commodity) {
    return res.status(400).json({ error: 'Missing required parameters: state, market, and commodity' });
  }

  try {
    console.log(`Fetching prices for: ${state} -> ${market} -> ${commodity}`);
    const data = await scrapeAgmarknetPrices(state, market, commodity);
    console.log('Scraping result:', data);

    if (data.error) {
      console.error('Scraping error:', data.error);
      return res.status(500).json({ error: data.error });
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Prices scraping error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch price data', details: error.message });
  }
});

export default router;