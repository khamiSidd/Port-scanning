import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

import { exportToCSV, exportToJSON } from './utils/export_results/export';

const HomePage = ({ onSelectScan }) => {
  const scanCategories = [
    {
      title: "Connection-Based Scans",
      scans: [
        { name: "TCP Connect", description: "Complete TCP three-way handshake" },
        { name: "TCP SYN", description: "Half-open SYN scan (stealth)" },
        { name: "TCP FIN", description: "FIN flag scan for firewall bypass" }
      ]
    },
    {
      title: "Xmas & Flag-Based Scans",
      scans: [
        { name: "TCP Xmas", description: "FIN, PSH, URG flags set" },
        { name: "TCP Null", description: "No flags set" },
        { name: "TCP ACK", description: "ACK flag for firewall detection" }
      ]
    },
    {
      title: "Advanced Scans",
      scans: [
        { name: "TCP Window", description: "Window size analysis" },
        { name: "UDP", description: "UDP port scanning" },
        { name: "Idle", description: "Zombie host stealth scan" }
      ]
    }
  ];

  return (
    <div className="home-page">
      <header className="App-header">
        <h1>IMPLEMENTATION OF PORT SCANNING TECHNIQUES</h1>
      </header>
      <div className="Contributors">
        <p>Carried out by:</p>
        <p>Anirudh S (231IT006)</p>
        <p>Siddharth K (231IT071)</p>
        <p>Srujan Swamy (231IT079)</p>
      </div>

      <div className="scan-categories">
        {scanCategories.map((category, idx) => (
          <div key={idx} className="category-section">
            <h2 className="category-title">{category.title}</h2>
            <div className="scan-grid">
              {category.scans.map((scan) => (
                <button
                  key={scan.name}
                  onClick={() => onSelectScan(scan.name)}
                  className="scan-card"
                >
                  <h3>{scan.name}</h3>
                  <p>{scan.description}</p>
                  <span className="arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScanPage = ({ scanType, onBack }) => {
  const [targetIp, setTargetIp] = useState('');
  const [ports, setPorts] = useState('1-100');
  const [zombieIp, setZombieIp] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/scan', {
        target_ip: targetIp,
        ports,
        scan_type: scanType,
        zombie_ip: scanType === 'Idle' ? zombieIp : undefined,
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scan-page">
      <div className="scan-header">
        <button onClick={onBack} className="back-button">
          ← Back to Scan Selection
        </button>
        <h1>{scanType} Scan</h1>
        <p>Configure and execute your port scan</p>
      </div>

      <form onSubmit={handleSubmit} className="scan-form">
        <div className="form-group">
          <label htmlFor="targetIp">Target IP Address</label>
          <input
            id="targetIp"
            type="text"
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            placeholder="e.g., 127.0.0.1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ports">Port Range</label>
          <input
            id="ports"
            type="text"
            value={ports}
            onChange={(e) => setPorts(e.target.value)}
            placeholder="e.g., 80, 443 or 1-1024"
            required
          />
        </div>

        {scanType === 'Idle' && (
          <div className="form-group">
            <label htmlFor="zombieIp">Zombie IP Address</label>
            <input
              id="zombieIp"
              type="text"
              value={zombieIp}
              onChange={(e) => setZombieIp(e.target.value)}
              placeholder="e.g., 192.168.1.5"
              required
            />
          </div>
        )}

        <div className="form-group full-width">
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="results-container">
          <div className="results-header">
            <h2>Scan Results for {targetIp}</h2>
            <div className="export-buttons">
              <button onClick={() => exportToCSV(results, targetIp)}>Export CSV</button>
              <button onClick={() => exportToJSON(results, targetIp)}>Export JSON</button>
            </div>
          </div>
          
          <table className="results-table">
            <thead>
              <tr>
                <th>Port</th>
                <th>Status</th>
                <th>Latency (ms)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.port}</td>
                  <td className={`status-${result.status.replace('|', '')}`}>{result.status}</td>
                  <td>{result.latency_ms || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedScan, setSelectedScan] = useState('');

  const handleSelectScan = (scanType) => {
    setSelectedScan(scanType);
    setCurrentPage('scan');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedScan('');
  };

  return (
    <div className="App">
      {currentPage === 'home' ? (
        <HomePage onSelectScan={handleSelectScan} />
      ) : (
        <ScanPage scanType={selectedScan} onBack={handleBackToHome} />
      )}
    </div>
  );
}

export default App;