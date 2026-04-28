import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for persistent login
    const storedUser = localStorage.getItem("ArcLight-SOS_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`https://arclight-sos.onrender.com/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    setUser(data);
    localStorage.setItem("ArcLight-SOS_user", JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, defaultRoom) => {
    const res = await fetch(`https://arclight-sos.onrender.com/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, defaultRoom }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    setUser(data);
    localStorage.setItem("ArcLight-SOS_user", JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ArcLight-SOS_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
