import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { run, query, get } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Link Generation
app.post('/api/links', async (req, res) => {
  try {
    const targetUrl = req.body?.targetUrl || '';
    const id = crypto.randomBytes(4).toString('hex');
    
    await run('INSERT INTO links (id, targetUrl) VALUES (?, ?)', [id, targetUrl]);
    
    res.json({ id, targetUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate link' });
  }
});

// 2. Click Handling and Geo-location
app.get('/t/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const link = await get('SELECT * FROM links WHERE id = ?', [id]);
    if (!link) {
      return res.status(404).send('Not found');
    }

    let ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    let country = 'Unknown', region = 'Unknown', city = 'Unknown', isp = 'Unknown';
    let trueIp = ip.split(',')[0].trim();
    
    // Explicitly handle mapped IPv4-in-IPv6 addresses and localhosts
    if (trueIp.startsWith('::ffff:')) {
      trueIp = trueIp.replace('::ffff:', '');
    }
    
    const isLocal = trueIp === '127.0.0.1' || trueIp === '::1' || trueIp.startsWith('192.168.');
    
    if (isLocal) {
      country = 'Local Network';
      region = 'Local';
      city = 'Local';
      isp = 'Localhost';
    } else {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${trueIp}`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            country = geoData.country;
            region = geoData.regionName;
            city = geoData.city;
            isp = geoData.isp;
          }
        }
      } catch (err) {
        console.error('IP fetch error:', err);
      }
    }

    await run(`
      INSERT INTO clicks (linkId, ip, country, region, city, isp, userAgent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, trueIp, country, region, city, isp, userAgent]);

    if (link.targetUrl && link.targetUrl.startsWith('http')) {
      return res.redirect(307, link.targetUrl);
    }
    
    return res.status(404).send('<html><body><script>window.close();</script>404 Not Found</body></html>');

  } catch (err) {
    console.error('Tracking error:', err);
    return res.status(500).send('Error');
  }
});

// 3. Stats Retrieval
app.get('/api/stats/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const link = await get('SELECT * FROM links WHERE id = ?', [id]);
    if (!link) {
      return res.status(404).json({ error: 'Not found' });
    }

    const clicks = await query('SELECT * FROM clicks WHERE linkId = ? ORDER BY clickedAt DESC', [id]);
    
    res.json({ link, clicks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend API running on port ${PORT}`);
});
