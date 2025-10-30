import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shopper from './pages/Shopper';
import Seller from './pages/Seller';
import Admin from './pages/Admin';
import { supabase } from './supabaseClient';

export default function App() {
  React.useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.from('products').select().limit(1);
      if (error) {
        console.error('Supabase connection error:', error);
      } else {
        console.log('Supabase connected successfully.');
      }
    }
    checkConnection();
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Shopper />} />
        <Route path="/seller" element={<Seller />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}