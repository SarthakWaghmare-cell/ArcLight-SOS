import React, { useState, useEffect } from 'react';
import { Flame, Plus, Shield, ShieldAlert, CheckCircle2, Clock, MapPin, Activity, User } from 'lucide-react';

const icons = {
  Fire: <Flame className="w-5 h-5 text-orange-500" />,
  Medical: <Plus className="w-5 h-5 text-blue-500" />,
  Security: <Shield className="w-5 h-5 text-purple-500" />,
  Other: <ShieldAlert className="w-5 h-5 text-gray-400" />
};

const statusColors = {
  Active: 'bg-primary/20 text-primary border-primary/30',
  Pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  Escalated: 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse',
  Acknowledged: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  Resolved: 'bg-green-500/20 text-green-500 border-green-500/30',
};

const priorityColors = {
  Low: 'text-gray-400',
  Medium: 'text-yellow-400',
  High: 'text-orange-500',
  Critical: 'text-red-500 font-bold animate-pulse'
};

const AlertCard = ({ alert, onUpdateStatus, onAcknowledge }) => {
  const { _id, room, type, status, createdAt, priority, handlerId, heartbeatStatus, isSilent } = alert;
  
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status === 'Resolved') return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((new Date() - new Date(createdAt)) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, status]);
  
  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <div className={`glass-panel p-5 transition-all duration-300 relative overflow-hidden group ${status === 'Resolved' ? 'opacity-60' : ''}`}>
      
      {/* Accent edge line */}
      {(status === 'Active' || status === 'Escalated') && (
        <>
          <div className={`absolute left-0 top-0 bottom-0 w-1 blur-sm ${status === 'Escalated' ? 'bg-red-500' : 'bg-primary'}`}></div>
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'Escalated' ? 'bg-red-500' : 'bg-primary'}`}></div>
        </>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 relative">
            {icons[type] || icons.Other}
            {isSilent && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">SILENT</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {type} Emergency
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <MapPin className="w-3.5 h-3.5" /> Room {room}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${statusColors[status]}`}>
            {status.toUpperCase()}
          </span>
          <span className={`text-[11px] uppercase tracking-wider font-bold ${priorityColors[priority || 'High']}`}>
            {priority || 'High'} Priority
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2 border border-white/5">
          <Clock className="w-4 h-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">Live Timer</span>
            <span className={`text-sm font-mono font-bold ${elapsed > 20 && status !== 'Resolved' && status !== 'Acknowledged' ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
              {status === 'Resolved' ? 'Ended' : `${elapsed}s elapsed`}
            </span>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2 border border-white/5">
          <Activity className={`w-4 h-4 ${heartbeatStatus === 'Unresponsive' ? 'text-red-500 animate-ping' : 'text-green-500'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">Heartbeat</span>
            <span className={`text-sm font-bold ${heartbeatStatus === 'Unresponsive' ? 'text-red-500' : 'text-green-500'}`}>
              {heartbeatStatus || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {handlerId && (
        <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-300 font-medium">Handled by: {handlerId}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          {time} • {date}
        </div>

        <div className="flex gap-2">
          {status !== 'Resolved' && (
            <button
              onClick={() => onUpdateStatus(_id, 'Resolved')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-green-500/10 text-gray-300 hover:text-green-500 border border-white/5 hover:border-green-500/30 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Resolve
            </button>
          )}
          {(status === 'Active' || status === 'Escalated') && (
            <button
              onClick={() => onAcknowledge(_id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-blue-500/10 text-gray-300 hover:text-blue-500 border border-white/5 hover:border-blue-500/30 transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
