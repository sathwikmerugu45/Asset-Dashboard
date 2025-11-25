export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({ 
    message: 'Simple test API is working!',
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!process.env.API_KEY,
      hasBaseUrl: !!process.env.BASE_URL
    }
  });
}