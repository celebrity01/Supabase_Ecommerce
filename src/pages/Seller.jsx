import React from 'react';
import { supabase } from '../supabaseClient';

export default function Seller() {
  const [file, setFile] = React.useState(null);
  const [details, setDetails] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [shopName, setShopName] = React.useState('');
  const [shopLocation, setShopLocation] = React.useState('');
  const [ownerNumber, setOwnerNumber] = React.useState('');
  const [message, setMessage] = React.useState('');

  async function handleUpload(e) {
    e.preventDefault();
    setMessage('Uploading...');

    // Get current user and seller record
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      setMessage('You must be signed in as a seller to upload (admin must approve you).');
      return;
    }

    // Fetch seller row by auth_uid
    const { data: sellers, error: serror } = await supabase
      .from('sellers')
      .select('*')
      .eq('auth_uid', user.user.id)
      .single();

    if (serror || !sellers) {
      setMessage('Seller record not found. Contact admin to be approved.');
      return;
    }
    if (!sellers.is_approved) {
      setMessage('Your seller account is not approved yet.');
      return;
    }

    try {
      // upload image to storage
      const filePath = `${sellers.id}/${Date.now()}_${file.name}`;
      const uploadRes = await supabase.storage.from('product-images').upload(filePath, file, { upsert: false });
      if (uploadRes.error) throw uploadRes.error;

      // get public URL
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // Call RPC to insert product and log (enforces daily limit)
      const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_insert_product', {
        p_seller_id: sellers.id,
        p_product_image: publicUrl,
        p_product_details: details,
        p_price: parseFloat(price),
        p_shop_location: shopLocation,
        p_shop_name: shopName,
        p_owner_number: ownerNumber
      });

      if (rpcError) {
        throw rpcError;
      }

      setMessage('Upload successful. Product id: ' + rpcData);
    } catch (err) {
      console.error(err);
      setMessage('Upload failed: ' + err.message);
    }
  }

  return (
    <div>
      <h1>Seller Upload</h1>
      <form onSubmit={handleUpload}>
        <div>
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
        </div>
        <div>
          <label>Details</label>
          <textarea value={details} onChange={e => setDetails(e.target.value)} required />
        </div>
        <div>
          <label>Price</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div>
          <label>Shop Name</label>
          <input value={shopName} onChange={e => setShopName(e.target.value)} required />
        </div>
        <div>
          <label>Shop Location</label>
          <input value={shopLocation} onChange={e => setShopLocation(e.target.value)} required />
        </div>
        <div>
          <label>Owner Number</label>
          <input value={ownerNumber} onChange={e => setOwnerNumber(e.target.value)} required />
        </div>
        <button type="submit">Upload Product</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}