import React, { useState, useEffect } from 'react';
import { getViews } from '../services/api';
import { MdDownload } from 'react-icons/md';
import { FaEye, FaGlobe, FaNetworkWired } from 'react-icons/fa';
import './Analytics.css';

function Analytics() {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueIPs: 0,
    countries: {},
    networks: {}
  });

  const loadViews = async () => {
    try {
      const data = await getViews();
      if (data && data.views) {
        setViews(data.views);
        calculateStats(data.views);
      }
    } catch (error) {
      console.error('Error loading views:', error);
    }
    setLoading(false);
  };

  const calculateStats = (viewsData) => {
    const uniqueIPs = new Set();
    const countries = {};
    const networks = {};

    viewsData.forEach(view => {
      uniqueIPs.add(view.ip);
      
      if (view.country) {
        countries[view.country] = (countries[view.country] || 0) + 1;
      }
      
      if (view.network) {
        networks[view.network] = (networks[view.network] || 0) + 1;
      }
    });

    setStats({
      totalViews: viewsData.length,
      uniqueIPs: uniqueIPs.size,
      countries,
      networks
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    loadViews();
    // Refresh every 30 seconds
    const interval = setInterval(loadViews, 30000);
    return () => clearInterval(interval);
  }, [loadViews]);

  const downloadCSV = () => {
    let csv = 'IP Address,Country,Network,Timestamp\n';
    views.forEach(view => {
      csv += `"${view.ip}","${view.country || 'Unknown'}","${view.network || 'Unknown'}","${view.timestamp}"\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'cv-views-analytics.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 CV View Analytics</h1>
        <div className="analytics-actions">
          <a href="/" className="link-btn">View CV</a>
          <a href="/admin" className="link-btn">Edit CV</a>
          <button className="download-btn" onClick={downloadCSV}>
            <MdDownload /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <FaEye className="stat-icon" />
              <div className="stat-value">{stats.totalViews}</div>
              <div className="stat-label">Total Views</div>
            </div>
            <div className="stat-card">
              <FaGlobe className="stat-icon" />
              <div className="stat-value">{stats.uniqueIPs}</div>
              <div className="stat-label">Unique Visitors</div>
            </div>
            <div className="stat-card">
              <FaGlobe className="stat-icon" />
              <div className="stat-value">{Object.keys(stats.countries).length}</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-card">
              <FaNetworkWired className="stat-icon" />
              <div className="stat-value">{Object.keys(stats.networks).length}</div>
              <div className="stat-label">Networks</div>
            </div>
          </div>

          <div className="analytics-content">
            {/* Countries */}
            <div className="analytics-section">
              <h2>🌍 Views by Country</h2>
              <div className="chart-container">
                {Object.entries(stats.countries).length > 0 ? (
                  <div className="country-list">
                    {Object.entries(stats.countries)
                      .sort((a, b) => b[1] - a[1])
                      .map(([country, count]) => (
                        <div key={country} className="country-item">
                          <span className="country-name">{country}</span>
                          <div className="bar-container">
                            <div 
                              className="bar" 
                              style={{
                                width: `${(count / stats.totalViews) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="country-count">{count}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="no-data">No country data available</p>
                )}
              </div>
            </div>

            {/* Networks */}
            <div className="analytics-section">
              <h2>🌐 Views by Network</h2>
              <div className="chart-container">
                {Object.entries(stats.networks).length > 0 ? (
                  <div className="network-list">
                    {Object.entries(stats.networks)
                      .sort((a, b) => b[1] - a[1])
                      .map(([network, count]) => (
                        <div key={network} className="network-item">
                          <span className="network-name">{network}</span>
                          <div className="bar-container">
                            <div 
                              className="bar" 
                              style={{
                                width: `${(count / stats.totalViews) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="network-count">{count}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="no-data">No network data available</p>
                )}
              </div>
            </div>

            {/* Recent Views */}
            <div className="analytics-section full-width">
              <h2>📝 Recent Views</h2>
              <div className="table-container">
                {views.length > 0 ? (
                  <table className="views-table">
                    <thead>
                      <tr>
                        <th>IP Address</th>
                        <th>Country</th>
                        <th>Network</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {views
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 50)
                        .map((view, i) => (
                          <tr key={i}>
                            <td className="ip-address">{view.ip}</td>
                            <td>{view.country || 'Unknown'}</td>
                            <td>{view.network || 'Unknown'}</td>
                            <td>{formatDate(view.timestamp)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No views recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
