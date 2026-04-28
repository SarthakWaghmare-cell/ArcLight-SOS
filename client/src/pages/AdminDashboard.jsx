import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import AlertCard from '../components/AlertCard';
import { ShieldAlert, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch initial alerts
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`/api/alerts`);
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // 2. Setup Socket listeners
    socket.on('alertUpdate', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      playAlertSound();
    });

    socket.on('alertStatusUpdate', (updatedAlert) => {
      setAlerts((prev) =>
        prev.map((alert) => (alert._id === updatedAlert._id ? updatedAlert : alert))
      );
    });

    socket.on('escalationUpdate', () => {
      fetchAlerts(); // Re-fetch alerts if escalation worker changed them
      playAlertSound();
    });

    return () => {
      socket.off('alertUpdate');
      socket.off('alertStatusUpdate');
      socket.off('escalationUpdate');
    };
  }, []);

  const playAlertSound = () => {
    // Basic beep sound synthesis
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 pitch
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch(e) {
      console.log("Audio play failed", e);
    }
  };

  const updateAlertStatus = async (id, status) => {
    try {
      await fetch(`/api/alert/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const acknowledgeAlert = async (id) => {
    try {
      await fetch(`/api/alert/${id}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handlerName: 'Admin ' + Math.floor(Math.random() * 100) })
      });
    } catch (err) {
      console.error("Failed to acknowledge", err);
    }
  };

  const activeCount = alerts.filter(a => a.status === 'Active').length;
  const pendingCount = alerts.filter(a => a.status === 'Pending').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Command Center
          </h1>
          <p className="text-gray-400 mt-1">Real-time emergency monitoring system</p>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="text-sm px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors origin-left md:origin-right w-fit"
        >
          View SOS Terminal
        </button>
      </div>

      {/* Stats row */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-6 border-t-4 border-t-primary">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Active Alerts</p>
              <p className="text-4xl font-bold text-primary">{activeCount}</p>
            </div>
            <Activity className="w-8 h-8 text-primary/30" />
          </div>
        </div>
        
        <div className="glass-panel p-6 border-t-4 border-t-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Pending Review</p>
              <p className="text-4xl font-bold text-yellow-500">{pendingCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500/30" />
          </div>
        </div>

        <div className="glass-panel p-6 border-t-4 border-t-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Resolved Today</p>
              <p className="text-4xl font-bold text-green-500">{resolvedCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500/30" />
          </div>
        </div>
      </div>

      {/* Grid of alerts */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Recent Incidents</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-300">All Clear</p>
            <p className="text-gray-500 mt-2">No emergency alerts registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map(alert => (
              <AlertCard 
                key={alert._id} 
                alert={alert} 
                onUpdateStatus={updateAlertStatus} 
                onAcknowledge={acknowledgeAlert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
