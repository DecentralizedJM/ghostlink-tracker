'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [targetUrl, setTargetUrl] = useState('');
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl })
      });
      const data = await res.json();
      
      const rawTrackingUrl = `${apiUrl}/t/${data.id}`;
      let finalTrackingUrl = rawTrackingUrl;
      
      try {
        const shortRes = await fetch(`${apiUrl}/api/shorten`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: rawTrackingUrl })
        });
        if (shortRes.ok) {
          const shortData = await shortRes.json();
          finalTrackingUrl = shortData.shortUrl || rawTrackingUrl;
        }
      } catch (err) {
        console.error('Shortener fallback', err);
      }

      setLinkData({
        id: data.id,
        trackingUrl: finalTrackingUrl,
        statsUrl: `/stats/${data.id}`
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '10vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="title-gradient" style={{ fontSize: '36px', marginBottom: '8px' }}>GhostLink Tracker</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generate stealth tracking links in seconds.</p>
      </div>

      <form onSubmit={generateLink}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Destination URL (Optional)
          </label>
          <input 
            type="url" 
            placeholder="https://google.com" 
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Create Tracking Link'}
        </button>
      </form>

      {linkData && (
        <div className="copy-area">
          <div>
            <h3>Your Tracking Link</h3>
            <a href={linkData.trackingUrl} target="_blank" rel="noopener noreferrer">{linkData.trackingUrl}</a>
          </div>
          <div>
            <h3>View Statistics</h3>
            <Link href={linkData.statsUrl} style={{ color: '#ec4899', textDecoration: 'none' }}>
              View Captured Data →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
