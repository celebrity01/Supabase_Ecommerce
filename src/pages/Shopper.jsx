import React from 'react';
import { supabase } from '../supabaseClient';

export default function Shopper() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, product_image, product_details, price, shop_location, shop_name, owner_number, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <h1>Products</h1>
      {products.length === 0 && <div>No products available.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
            {p.product_image && <img src={p.product_image} alt={p.product_details} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
            <h3>{p.shop_name} — {p.price}</h3>
            <p>{p.product_details}</p>
            <p><strong>Location:</strong> {p.shop_location}</p>
            <p><strong>Owner:</strong> {p.owner_number}</p>
          </div>
        ))}
      </div>
    </div>
  );
}