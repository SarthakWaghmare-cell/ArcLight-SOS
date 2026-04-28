import React, { useState, useEffect, useRef } from 'react';
import { Flame, Plus, Shield, ShieldAlert, MapPin, ArrowRight, Home, ClipboardList, Phone, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

const emergencyTypes = [
  { id: 'Medical', title: 'Medical\nEmergency', icon: Plus },
  { id: 'Fire', title: 'Fire\nAssistance', icon: Flame },
  { id: 'Security', title: 'Need\nSecurity', icon: Shield },
  { id: 'Other', title: 'Other\nIssue', icon: ShieldAlert },
];

const SOSPage = () => {
  const { user, logout } = useAuth();
  const [room, setRoom] = useState('');
  const [selectedType, setSelectedType] = useState('Medical');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.defaultRoom && !room) setRoom(user.defaultRoom);
  }, [user]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    let heartbeatInterval;
    if (activeAlertId) {
      heartbeatInterval = setInterval(async () => {
        try {
          await fetch(`/api/alert/${activeAlertId}/heartbeat`, { method: 'POST' });
        } catch (err) {
          console.error("Heartbeat failed", err);
        }
      }, 5000); // 5 seconds
    }
    return () => clearInterval(heartbeatInterval);
  }, [activeAlertId]);

  const getHumanReadableLocation = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const { road, suburb, neighbourhood, city, town, village, state, postcode } = data.address;

        let exactLoc = "";
        const street = road || neighbourhood || suburb || "";
        const cityName = city || town || village || "";

        if (street) exactLoc += `${street}, `;
        if (cityName) exactLoc += `${cityName}, `;
        if (state) exactLoc += state;
        if (postcode) exactLoc += ` - ${postcode}`;

        // Cleanup trailing commas if any
        if (exactLoc.endsWith(', ')) exactLoc = exactLoc.slice(0, -2);

        return exactLoc || data.display_name.split(',').slice(0, 3).join(', ');
      }
      return `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (e) {
      console.error("Geocoding failed", e);
      return `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const executeSosLogic = async (isSilent = false) => {
    if (!room.trim()) {
      if ("geolocation" in navigator) {
        setSending(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const locationName = await getHumanReadableLocation(latitude, longitude);
            setRoom(locationName);
            await sendAlertData(locationName, isSilent);
          },
          (error) => {
            setSending(false);
            alert("Location access denied. Please enter your Room No. manually.");
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        alert("Geolocation is not supported by your browser. Please enter your Room No.");
      }
    } else {
      setSending(true);
      await sendAlertData(room, isSilent);
    }
  };


  const handleSilentSos = (e) => {
    e.preventDefault(); // Prevent context menu
    if (sending || success) return;
    executeSosLogic(true);
    // TRULY SILENT: No UI changes whatsoever.
  };

  const handleSosClick = () => {
    if (sending || success) return;

    if (countdown !== null) {
      clearInterval(timerRef.current);
      setCountdown(null);
      return;
    }

    setCountdown(5);
    let currentCount = 5;
    timerRef.current = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);
      if (currentCount <= 0) {
        clearInterval(timerRef.current);
        setCountdown(null);
        executeSosLogic(false);
      }
    }, 1000);
  };

  const sendAlertData = async (finalRoom, isSilent = false) => {
    try {
      const response = await fetch(`/api/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: finalRoom, type: selectedType, isSilent })
      });

      if (!response.ok) throw new Error('Failed to send alert');
      
      const data = await response.json();
      setActiveAlertId(data._id);

      if (!isSilent) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send alert. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const RequestLocation = () => {
    if ("geolocation" in navigator) {
      setRoom("Locating...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = await getHumanReadableLocation(position.coords.latitude, position.coords.longitude);
          setRoom(loc);
        },
        (error) => {
          setRoom("");
          alert("Could not fetch location.");
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Display',sans-serif] relative overflow-x-hidden selection:bg-red-500 selection:text-white flex flex-col">

      {/* Top Bar */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start p-4 sm:p-6 md:p-10 gap-4">
        {/* User Profile - Interactive Button Area */}
        <div
          onClick={() => !user ? setIsAuthModalOpen(true) : logout()}
          className="flex items-center gap-3 relative cursor-pointer group p-1.5 -ml-1.5 rounded-full hover:bg-white/5 transition-all duration-300"
        >
          <div className="w-11 h-11 rounded-full bg-[#1C1C1E] overflow-hidden relative z-10 border-[1.5px] border-white/20 group-hover:border-red-500 group-hover:shadow-[0_0_15px_rgba(255,59,48,0.3)] transition-all flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
          </div>
          <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-red-500 z-0 group-hover:scale-125 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 opacity-90"></div>
          <div className="flex flex-col pr-2">
            <span className="text-[14.5px] text-gray-300 font-medium tracking-tight">
              Hello {user ? user.name.split(' ')[0] : 'Guest'}!
            </span>
            {user ? (
              <span className="text-[12.5px] font-bold text-gray-500 group-hover:text-red-500 transition-colors">Log out</span>
            ) : (
              <span className="text-[12.5px] font-bold text-red-500 group-hover:text-red-400 transition-colors">Update profile</span>
            )}
          </div>
        </div>

        {/* Location Input Group */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 focus-within:border-red-500/50 focus-within:bg-white/10 focus-within:shadow-[0_0_20px_rgba(255,59,48,0.15)] rounded-full px-4 py-2 transition-all duration-300">
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter Room No."
              className="bg-transparent text-[13px] sm:text-[14px] text-right font-medium text-white placeholder:text-gray-500 focus:outline-none w-[130px] sm:w-36 md:w-56 placeholder:transition-opacity focus:placeholder:opacity-50 text-ellipsis overflow-hidden whitespace-nowrap"
            />
            <div className="w-[1px] h-4 bg-white/20 mx-1 flex-shrink-0"></div>
            <button onClick={RequestLocation} title="Use Live Location" className="active:scale-95 transition-transform outline-none flex-shrink-0 p-1 -m-1">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 hover:text-red-400" />
            </button>
          </div>
          <span className="text-[11px] sm:text-[12px] font-semibold text-red-500 mt-2 mr-2 cursor-pointer hover:text-red-400 transition-colors" onClick={() => navigate('/admin')}>
            Staff Dashboard
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto pt-4 md:pt-10">
        {/* Main Title Section */}
        <div className="px-4 sm:px-6 text-center space-y-2 md:space-y-4">
          <h1 className="text-[28px] sm:text-[32px] md:text-[56px] font-bold tracking-tight text-white leading-[1.15]">
            Emergency help<br className="md:hidden"/> needed?
          </h1>
          <p className="text-[14px] sm:text-[15px] md:text-[20px] text-gray-400 font-medium px-4">Just tap the button to call</p>
        </div>

        {/* Huge Centered SOS Button */}
        <div className="flex-1 flex items-center justify-center py-6 sm:py-8 md:py-16 min-h-[280px]">
          <div className="relative group flex items-center justify-center">
            {/* Darker shadow ring for dark mode */}
            <div className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#0D0D0D] shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_10px_40px_rgba(255,59,48,0.15)] flex items-center justify-center p-[15px] sm:p-[20px] md:p-[30px] transition-all">

              <button
                onClick={handleSosClick}
                onContextMenu={handleSilentSos}
                disabled={sending || success}
                className={`
                  w-full h-full rounded-full flex flex-col items-center justify-center
                  transition-all duration-300 ease-out outline-none overflow-hidden
                  ${success
                    ? 'bg-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.4),inset_0_4px_15px_rgba(255,255,255,0.4)] scale-95'
                    : countdown !== null
                      ? 'bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] active:scale-95 shadow-inner'
                      : 'bg-gradient-to-b from-[#FF453A] to-[#D60000] active:scale-95 shadow-[0_15px_35px_rgba(255,59,48,0.4),inset_0_4px_15px_rgba(255,255,255,0.3)] hover:brightness-110'
                  }
                `}
              >
                {success ? (
                  <span className="text-[28px] font-bold text-white tracking-widest drop-shadow-md">SENT</span>
                ) : countdown !== null ? (
                  <div className="flex flex-col items-center justify-center w-full h-full relative">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="46" fill="none" stroke="#FF453A" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray="289"
                        strokeDashoffset={289 - (countdown / 5) * 289}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <span className="text-[72px] font-bold text-white leading-none z-10 drop-shadow-md tabular-nums">{countdown}</span>
                    <span className="text-[14px] font-bold text-white/50 mt-1 z-10 tracking-[0.2em]">TAP TO CANCEL</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    {/* SVG Radio Broadcast icon */}
                    <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
                      <path d="M12 12h.01"></path>
                      <path d="M8 8a6 6 0 0 0 0 8"></path>
                      <path d="M16 8a6 6 0 0 1 0 8"></path>
                      <path d="M5 5a10 10 0 0 0 0 14"></path>
                      <path d="M19 5a10 10 0 0 1 0 14"></path>
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {/* Pulsing rings when active */}
            {!success && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-red-500 pointer-events-none" style={{ animationDuration: '3s' }}></div>
            )}
          </div>
        </div>

        {/* Bottom Section - Emergency Types */}
        <div className="flex flex-col mt-auto bg-[#121212]/80 backdrop-blur-xl pb-6 pt-6 md:pb-12 md:pt-10 rounded-t-[28px] sm:rounded-t-[32px] md:rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] border-t border-white/5 w-full md:max-w-6xl md:mx-auto md:mb-10 z-10 relative">
          <div className="px-4 sm:px-6 mb-4 md:mb-8 md:text-center">
            <h2 className="text-[18px] sm:text-[20px] md:text-[28px] font-extrabold text-white tracking-tight">Not sure what to do?</h2>
            <p className="text-[13px] sm:text-[14px] md:text-[16px] text-gray-400 font-medium mt-0.5 md:mt-2">Pick the subject to alert</p>
          </div>

          <div className="flex md:grid overflow-x-auto md:overflow-visible gap-3 sm:gap-4 md:gap-6 px-4 sm:px-6 pb-2 snap-x snap-mandatory hide-scrollbar md:grid-cols-4 md:justify-center w-full">
            {emergencyTypes.map((type) => {
              const isSelected = selectedType === type.id;
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`
                    relative snap-start flex-shrink-0 w-[130px] h-[130px] sm:w-[140px] sm:h-[140px] md:w-full md:h-[180px] rounded-[20px] sm:rounded-[24px] md:rounded-[32px] p-4 md:p-6 flex flex-col justify-between text-left transition-all duration-300
                    ${isSelected 
                      ? 'bg-[#1C1C1E] shadow-[0_10px_30px_rgba(0,0,0,0.4)] border-2 border-red-500 transform md:-translate-y-2 -translate-y-1' 
                      : 'bg-[#1C1C1E] shadow-sm border-[1px] sm:border-2 border-transparent text-white hover:bg-[#2C2C2E] md:hover:-translate-y-1'
                    }
                  `}
                >
                  <span className={`text-[14px] sm:text-[15px] md:text-[18px] font-bold leading-tight whitespace-pre-line ${isSelected ? 'text-red-500' : 'text-white'}`}>
                    {type.title}
                  </span>
                  
                  <div className="flex items-end justify-between w-full">
                    <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 ${isSelected ? 'text-red-500' : 'text-red-500'}`} strokeWidth={2.5} />
                    <div className="opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                      <Icon className={`w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12 ${isSelected ? 'text-red-500' : 'text-[#8C9098]'}`} strokeWidth={1.5} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default SOSPage;
