import React from 'react';
import { supabase } from '../supabaseClient';

export default function Admin() {
  const [sellers, setSellers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSellers() {
      setLoading(true);
      const { data, error } = await supabase.from('sellers').select('*').order('created_at', { ascending: false });
      if (error) console.error(error);
      else setSellers(data || []);
      setLoading(false);
    }
    loadSellers();
  }, []);

  async function approveSeller(id, approve) {
    const { error } = await supabase.from('sellers').update({ is_approved: approve }).eq('id', id);
    if (error) console.error(error);
    else {
      setSellers(prev => prev.map(s => s.id === id ? { ...s, is_approved: approve } : s));
    }
  }

  async function setLimit(id, limit) {
    const { error } = await supabase.from('sellers').update({ daily_upload_limit: limit }).eq('id', id);
    if (error) console.error(error);
    else {
      setSellers(prev => prev.map(s => s.id === id ? { ...s, daily_upload_limit: limit } : s));
    }
  }

  if (loading) return <div>Loading admin...</div>;

  return (
    <div>
      <h1>Admin Portal</h1>
      <table>
        <thead><tr><th>Shop</th><th>Email</th><th>Approved</th><th>Daily Limit</th><th>Actions</th></tr></thead>
        <tbody>
          {sellers.map(s => (
            <tr key={s.id}>
              <td>{s.shop_name}</td>
              <td>{s.email}</td>
              <td>{String(s.is_approved)}</td>
              <td>
                <input type="number" defaultValue={s.daily_upload_limit} onBlur={(e) => setLimit(s.id, parseInt(e.target.value || 0))} />
              </td>
              <td>
                <button onClick={() => approveSeller(s.id, true)}>Approve</button>
                <button onClick={() => approveSeller(s.id, false)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}