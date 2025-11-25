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
    const buildingName = req.query.building ? String(req.query.building) : 'Computer Center';

    // Find building by name (case-insensitive). We use fetchAllRecords to ensure full dataset.
    const buildings = await fetchAllRecords('Buildings');
    const building = buildings.find(b => (b.Building_Name || b.Name || b.name || '') && (String(b.Building_Name || b.Name || b.name).toLowerCase() === buildingName.toLowerCase()));

    if (!building) {
      const msg = `Building not found: ${buildingName}`;
      console.log(`⚠ ${msg}`);
      return res.status(404).json({ Building_Name: buildingName, Count: 0, Message: msg });
    }

    // Fetch all assets and count active ones belonging to the building
    const assets = await fetchAllRecords('Asset');
    const activeValues = new Set(['Yes', 'Active', true, 1, '1']);

    const count = assets.reduce((acc, a) => {
      const belongs = (a.Building_Id != null) && (String(a.Building_Id) == String(building.id));
      const isActive = activeValues.has(a.is_active) || activeValues.has(String(a.is_active));
      return acc + ((belongs && isActive) ? 1 : 0);
    }, 0);

    const msg = `Active assets in "${buildingName}": ${count}`;
    console.log(msg);

    res.json({ Building_Name: buildingName, BuildingId: building.id, Count: count, Message: msg });
  } catch (err) {
    console.error('Error in admin/count-active-assets:', err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
};