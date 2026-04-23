import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SOSPage from './pages/SOSPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
        <Routes>
          <Route path="/" element={<SOSPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
