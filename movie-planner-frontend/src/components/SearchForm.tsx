import { useState } from "react";

const SearchForm = ({ onSearch }: { onSearch: (params: any) => void }) => {
  const [formData, setFormData] = useState({
    zip: '',
    radius: '10',
    startDate: new Date().toISOString().split('T')[0],
    numDays: '7',
    apiKey: ''//'ux4nx6g5dmdkv2cp6tcpgzya' // Users should input their own key
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>Find Showtimes</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Zip Code" required value={formData.zip} 
          onChange={e => setFormData({...formData, zip: e.target.value})} style={inputStyle} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Radius (mi)</label>
            <input type="number" value={formData.radius} 
              onChange={e => setFormData({...formData, radius: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Days</label>
            <input type="number" min="1" max="7" value={formData.numDays} 
              onChange={e => setFormData({...formData, numDays: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <input type="date" value={formData.startDate} 
          onChange={e => setFormData({...formData, startDate: e.target.value})} style={inputStyle} />
        
        <button type="submit" style={btnStyle}>Search Movies</button>
      </form>
    </div>
  );
};

const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' };
const labelStyle = { fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' };
const btnStyle = { padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

export default SearchForm;