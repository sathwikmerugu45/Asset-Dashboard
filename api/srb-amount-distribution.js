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
    
    // Parse amounts and categorize
    const ranges = {
      above1Cr: { count: 0, total: 0, items: [] },      // >= 1 crore (10,000,000)
      between10LTo1Cr: { count: 0, total: 0, items: [] }, // 10L to <1Cr
      between1LTo10L: { count: 0, total: 0, items: [] },  // 1L to <10L
      below1L: { count: 0, total: 0, items: [] },         // < 1L
      noAmount: { count: 0, total: 0, items: [] },
    };

    srbDetails.forEach(srb => {
      // Amount is already a number in the API response
      const amount = parseFloat(srb.Amount) || 0;
      
      const item = {
        id: srb.id,
        srb_number: srb.SRB_Number || 'Unknown',
        amount: amount,
        asset_code: (srb.Asset_Code === 'NULL' || !srb.Asset_Code) ? 'Unknown' : srb.Asset_Code,
        item_description: (srb.Item_Description === 'NULL' || !srb.Item_Description) ? 'Unknown' : srb.Item_Description,
      };

      if (amount === 0) {
        ranges.noAmount.count++;
        ranges.noAmount.items.push(item);
      } else if (amount >= 10000000) { // >= 1 Cr
        ranges.above1Cr.count++;
        ranges.above1Cr.total += amount;
        ranges.above1Cr.items.push(item);
      } else if (amount >= 1000000) { // 10L to 1Cr
        ranges.between10LTo1Cr.count++;
        ranges.between10LTo1Cr.total += amount;
        ranges.between10LTo1Cr.items.push(item);
      } else if (amount >= 100000) { // 1L to 10L
        ranges.between1LTo10L.count++;
        ranges.between1LTo10L.total += amount;
        ranges.between1LTo10L.items.push(item);
      } else { // < 1L
        ranges.below1L.count++;
        ranges.below1L.total += amount;
        ranges.below1L.items.push(item);
      }
    });

    const result = {
      ranges,
      totalRecords: srbDetails.length,
      totalAmount: Object.values(ranges).reduce((sum, r) => sum + r.total, 0),
    };

    res.json(result);
  } catch (error) {
    console.error('Error in srb-amount-distribution API:', error);
    res.status(500).json({ error: error.message });
  }
};