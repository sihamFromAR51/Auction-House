import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listings as listingsApi, categories as categoriesApi } from '../services/api';
import { FALLBACK_CATEGORIES } from '../categories';
import './CreateListing.css';

export default function CreateListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    type: 'fixed',
    price: '',
    startingBid: '',
    reservePrice: '',
    endDate: '',
    images: [],
  });

  useEffect(() => {
    categoriesApi.getAll()
      .then((res) => setCategories(res.data.categories))
      .catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = [...e.target.files];
    setForm({ ...form, images: files });
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const base64Images = await Promise.all(
        form.images.map((file) => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })),
      );

      const { data } = await listingsApi.create({
        ...form,
        images: base64Images,
      });
      navigate(`/listings/${data.listing._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
  };

  return (
    <div className="container create-listing">
      <div className="create-listing-card card">
        <div className="create-listing-header">
          <h2>Create a Listing</h2>
          <p>List your item for sale or auction</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. 1920 British Indian Rupee Silver Coin"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="form-input" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Listing Type</label>
              <select name="type" className="form-input" value={form.type} onChange={handleChange}>
                <option value="fixed">Fixed Price</option>
                <option value="auction">Auction</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input"
              placeholder="Describe your item in detail — condition, history, authenticity..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            {form.type === 'fixed' ? (
              <div className="form-group">
                <label className="form-label">Price (BDT)</label>
                <input
                  type="number"
                  name="price"
                  className="form-input"
                  placeholder="5000"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Starting Bid (BDT)</label>
                  <input
                    type="number"
                    name="startingBid"
                    className="form-input"
                    placeholder="1000"
                    min="0"
                    value={form.startingBid}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reserve Price (optional)</label>
                  <input
                    type="number"
                    name="reservePrice"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    value={form.reservePrice}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          {form.type === 'auction' && (
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="datetime-local"
                name="endDate"
                className="form-input"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="form-input"
            />
            <span className="form-hint">Select photos to preview</span>
            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((url, i) => (
                  <div key={i} className="image-preview-thumb">
                    <img src={url} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Publish Listing
          </button>
        </form>
      </div>
    </div>
  );
}
