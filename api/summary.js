const { fetchAllRecords, fetchFromAPI } = require('./_utils');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [assets, srbDetails, buildings, instances] = await Promise.all([
      fetchAllRecords('Asset'),
      fetchAllRecords('SRB_Details'),
      fetchFromAPI('/api/Buildings:list'),
      fetchAllRecords('Instance'),
    ]);

    const totalSRBAmount = srbDetails.reduce((sum, srb) => {
      // Amount is already a number
      const amount = parseFloat(srb.Amount) || 0;
      return sum + amount;
    }, 0);

    const activeAssets = assets.filter(a => a.is_active === 'Yes').length;

    const result = {
      totalAssets: assets.length,
      activeAssets,
      inactiveAssets: assets.length - activeAssets,
      totalInstances: instances.length,
      totalBuildings: buildings.length,
      totalSRBRecords: srbDetails.length,
      totalSRBAmount,
      avgSRBAmount: srbDetails.length > 0 ? totalSRBAmount / srbDetails.length : 0,
    };

    res.json(result);
  } catch (error) {
    console.error('Error in summary API:', error);
    res.status(500).json({ error: error.message });
  }
};