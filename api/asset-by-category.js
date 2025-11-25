const { fetchAllRecords } = require('./_utils');

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
    const srbDetails = await fetchAllRecords('SRB_Details');
    
    // Group by Asset_Code
    const categoryMap = {};
    
    srbDetails.forEach(srb => {
      const code = (srb.Asset_Code === 'NULL' || !srb.Asset_Code) ? 'Unknown' : srb.Asset_Code;
      if (!categoryMap[code]) {
        categoryMap[code] = { category: code, count: 0, totalAmount: 0, items: [] };
      }
      // Amount is already a number
      const amount = parseFloat(srb.Amount) || 0;
      categoryMap[code].count++;
      categoryMap[code].totalAmount += amount;
      categoryMap[code].items.push({
        id: srb.id,
        srb_number: srb.SRB_Number || 'Unknown',
        amount: amount,
        description: (srb.Item_Description === 'NULL' || !srb.Item_Description) ? 'Unknown' : srb.Item_Description,
      });
    });

    const categories = Object.values(categoryMap).sort((a, b) => b.count - a.count);

    const result = {
      categories,
      totalCategories: categories.length,
      totalRecords: srbDetails.length,
    };

    res.json(result);
  } catch (error) {
    console.error('Error in asset-by-category API:', error);
    res.status(500).json({ error: error.message });
  }
};