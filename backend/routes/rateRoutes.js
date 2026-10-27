import express from 'express';

const router = express.Router();

// ==========================================
// IN-MEMORY CACHE
// Rates refresh once daily, so cache for 6 hours
// ==========================================
let cachedRates = null;
let cacheTimestamp = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// ==========================================
// FALLBACK RATES (if API fails)
// Update these manually as a safety net
// ==========================================
const FALLBACK_RATES = {
  USD: 1,
  NGN: 1600,
  GBP: 0.79,
};

// ==========================================
// GET /api/rates
// Returns live rates based on USD
// ==========================================
router.get('/', async (req, res) => {
  try {
    // ✅ Return cached rates if fresh
    if (
      cachedRates &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    ) {
      console.log('📦 Serving cached rates');
      return res.json({
        success: true,
        source: 'cache',
        rates: cachedRates,
        updatedAt: new Date(cacheTimestamp).toISOString(),
      });
    }

    // ✅ Fetch fresh rates from ExchangeRate-API (Open Access — no key needed)
    console.log('🌐 Fetching live rates from ExchangeRate-API');
    const response = await fetch('https://open.er-api.com/v6/latest/USD');

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 'success' || !data.rates) {
      throw new Error('Invalid response from ExchangeRate-API');
    }

    // ✅ Extract only the currencies we support
    const rates = {
      USD: 1,
      NGN: data.rates.NGN,
      GBP: data.rates.GBP,
    };

    // Validate the rates exist
    if (!rates.NGN || !rates.GBP) {
      throw new Error('Missing NGN or GBP in API response');
    }

    // ✅ Update cache
    cachedRates = rates;
    cacheTimestamp = Date.now();

    console.log('✅ Live rates fetched:', rates);

    res.json({
      success: true,
      source: 'live',
      rates,
      updatedAt: new Date(cacheTimestamp).toISOString(),
      nextUpdate: data.time_next_update_utc,
    });
  } catch (error) {
    console.error('❌ Error fetching rates:', error.message);

    // ✅ Fall back to cached rates if available
    if (cachedRates) {
      return res.json({
        success: true,
        source: 'stale-cache',
        rates: cachedRates,
        updatedAt: new Date(cacheTimestamp).toISOString(),
        warning: 'Using cached rates — API unavailable',
      });
    }

    // ✅ Final fallback — hardcoded rates
    console.log('⚠️ Using fallback rates');
    res.json({
      success: true,
      source: 'fallback',
      rates: FALLBACK_RATES,
      warning: 'Using fallback rates — API unavailable',
    });
  }
});

export default router;