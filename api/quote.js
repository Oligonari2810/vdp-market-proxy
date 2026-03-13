const FH_KEY = "d6q46lhr01qhcrmiq8s0d6q46lhr01qhcrmiq8sg";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const [quote, profile, metrics] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FH_KEY}`).then(r => r.json()),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FH_KEY}`).then(r => r.json()),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FH_KEY}`).then(r => r.json()),
    ]);

    res.status(200).json({ quote, profile, metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
