import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { exportToCSV, exportToJSON } from '../utils/export_results/export';
import axios from 'axios';
import { getToken } from '../services/authService';

const ScanPage = () => {
  const { scanType } = useParams(); // Get scanType from URL
  const navigate = useNavigate(); // Get navigate function

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

    const token = getToken();
    if (!token) {
      setError('You are not logged in.');
      setIsLoading(false);
      // Optional: redirect to login
      // navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/scan',
        {
          target_ip: targetIp,
          ports,
          scan_type: scanType,
          zombie_ip: scanType === 'Idle' ? zombieIp : undefined,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
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
       <button onClick={() => navigate('/')} className="back-button">
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

export default ScanPage;