'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function Stats({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/stats/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <h2 className="title-gradient">Loading data...</h2>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <h2 style={{ color: '#ef4444' }}>Stats not found</h2>
        <Link href="/" className="stats-link">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
        ← Back to Home
      </Link>
      
      <div className="glass-panel" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="title-gradient" style={{ fontSize: '32px', marginBottom: '8px' }}>Link Statistics</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', wordBreak: 'break-all' }}>
              Tracking ID: <span style={{ color: 'white' }}>{id}</span><br />
              Target: <span style={{ color: 'white' }}>{data.link.targetUrl || 'None (404/Blank)'}</span>
            </div>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Clicks</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', fontFamily: 'Outfit' }}>
              <span className="pulse-dot"></span>
              {data.clicks.length}
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontFamily: 'Outfit' }}>Visitor Logs</h2>
      
      <div className="glass-panel" style={{ padding: '0 0 16px 0', overflow: 'hidden' }}>
        {data.clicks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Waiting for clicks... share your tracking link!
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>IP Address</th>
                  <th>Location</th>
                  <th>ISP</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {data.clicks.map(click => (
                  <tr key={click.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {new Date(click.clickedAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge">{click.ip}</span>
                    </td>
                    <td>
                      {click.city}, {click.region}<br />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{click.country}</span>
                    </td>
                    <td style={{ fontSize: '14px', maxWidth: '150px' }}>{click.isp}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px', wordBreak: 'break-all' }}>
                      {click.userAgent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
