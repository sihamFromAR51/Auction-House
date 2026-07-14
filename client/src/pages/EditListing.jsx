import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listings as listingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FALLBACK_CATEGORIES } from '../categories';
import './CreateListing.css';

export default function EditListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    type: 'fixed',
    price: '',
    startingBid: '',
    reservePrice: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await listingsApi.getById(id);
        const listing = res.data.listing;
        if (!user || listing.seller?._id !== user._id) {
          navigate('/');
          return;
        }
        if (listing.status !== 'active') {
          setError('Cannot edit a sold item');
          setLoading(false);
          return;
        }
        setForm({
          title: listing.title || '',
          category: listing.category?._id || '',
          type: listing.type || 'fixed',
          price: listing.price || '',
          startingBid: listing.startingBid || '',
          reservePrice: listing.reservePrice || '',
          endDate: listing.endDate ? listing.endDate.slice(0, 16) : '',
          description: listing.description || '',
        });
        if (listing.images?.length) {
          setPreviews(listing.images);
        }
      } catch { navigate('/'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = (e) => {
    const files = [...e.target.files];
    setForm({ ...form, images: files });
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let images = form.images;
      if (images?.length && images[0] instanceof File) {
        images = await Promise.all(
          images.map((file) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })),
        );
      }
      const { data } = await listingsApi.update(id, { ...form, images });
      navigate(`/listings/${data.listing._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update listing');
    }
  };

  if (loading) return <div className="container" style={{ padding: 60, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container create-listing">
      <div className="create-layout">
        <div className="create-listing-card card">
          <div className="create-listing-header">
            <h2>Edit Listing</h2>
            <p>Update your item details</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          {error && error.includes('sold') ? (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => navigate('/my-listings')}>Back to My Listings</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" name="title" className="form-input" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-input" value={form.category} onChange={handleChange} required>
                    <option value="">Select</option>
                    {FALLBACK_CATEGORIES.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select name="type" className="form-input" value={form.type} onChange={handleChange}>
                    <option value="fixed">Fixed Price</option>
                    <option value="auction">Auction</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" value={form.description} onChange={handleChange} required />
              </div>
              <div className="form-row">
                {form.type === 'fixed' ? (
                  <div className="form-group">
                    <label className="form-label">Price (BDT)</label>
                    <input type="number" name="price" className="form-input" min="1" value={form.price} onChange={handleChange} required />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Starting Bid (BDT)</label>
                      <input type="number" name="startingBid" className="form-input" min="1" value={form.startingBid} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reserve Price</label>
                      <input type="number" name="reservePrice" className="form-input" min="0" value={form.reservePrice} onChange={handleChange} />
                    </div>
                  </>
                )}
              </div>
              {form.type === 'auction' && (
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="datetime-local" name="endDate" className="form-input" value={form.endDate} onChange={handleChange} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Images</label>
                <div className="image-upload-area" onClick={() => document.getElementById('img-input').click()}>
                  {previews.length === 0 ? (
                    <div className="image-upload-placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                      <span>Click to upload photos</span>
                    </div>
                  ) : (
                    <div className="image-previews">
                      {previews.map((url, i) => (
                        <div key={i} className="image-preview-thumb"><img src={url} alt="" /></div>
                      ))}
                    </div>
                  )}
                </div>
                <input id="img-input" type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Save Changes</button>
            </form>
          )}
        </div>
        <div className="create-tips card">
          <h3>Editing Tips</h3>
          <ul>
            <li>Updating photos will replace existing ones</li>
            <li>Price changes apply immediately</li>
            <li>Sold items cannot be edited</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
