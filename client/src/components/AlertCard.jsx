import React from 'react';
import { Flame, Plus, Shield, ShieldAlert, CheckCircle2, Clock, MapPin } from 'lucide-react';

const icons = {
  Fire: <Flame className="w-5 h-5 text-orange-500" />,
  Medical: <Plus className="w-5 h-5 text-blue-500" />,
  Security: <Shield className="w-5 h-5 text-purple-500" />,
  Other: <ShieldAlert className="w-5 h-5 text-gray-400" />
};

const statusColors = {
  Active: 'bg-primary/20 text-primary border-primary/30',
  Pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  Resolved: 'bg-green-500/20 text-green-500 border-green-500/30',
};

const AlertCard = ({ alert, onUpdateStatus }) => {
  const { _id, room, type, status, createdAt } = alert;
  
  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <div className={`glass-panel p-5 transition-all duration-300 relative overflow-hidden group ${status === 'Resolved' ? 'opacity-60' : ''}`}>
      
      {/* Accent edge line for Active status */}
      {status === 'Active' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary blur-sm"></div>
      )}
      {status === 'Active' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            {icons[type] || icons.Other}
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

        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${statusColors[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 md:mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Clock className="w-3.5 h-3.5" />
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
          {status === 'Active' && (
            <button
              onClick={() => onUpdateStatus(_id, 'Pending')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-yellow-500/10 text-gray-300 hover:text-yellow-500 border border-white/5 hover:border-yellow-500/30 transition-colors"
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
