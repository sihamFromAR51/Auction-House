import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroBanner from '../components/HeroBanner';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { listings as listingsApi, categories as categoriesApi } from '../services/api';
import { FALLBACK_CATEGORIES } from '../categories';
import { getRecentViews, getViewedCategoryIds } from '../config';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [mode, setMode] = useState('buy');
  const [listings, setListings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const recentViews = getRecentViews();

  useEffect(() => {
    const fetch = async () => {
      setCategories(FALLBACK_CATEGORIES);
      try {
        const listingsRes = await listingsApi.getAll({ limit: 12, sort: 'newest' });
        setListings(listingsRes.data.listings || []);
      } catch {}
      try {
        const catIds = getViewedCategoryIds();
        if (catIds.length > 0) {
          const sugRes = await listingsApi.getAll({ category: catIds[0], limit: 4, sort: 'newest' });
          setSuggestions((sugRes.data.listings || []).filter((l) => !recentViews.find((rv) => rv._id === l._id) && !listings.find((ls) => ls._id === l._id)));
        }
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <>
      <HeroBanner />

      <section className="container mode-toggle-section">
        <div className="mode-toggle">
          <button className={`mode-btn ${mode === 'buy' ? 'active' : ''}`} onClick={() => setMode('buy')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            I Want to Buy
          </button>
          <button className={`mode-btn ${mode === 'sell' ? 'active' : ''}`} onClick={() => setMode('sell')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            I Want to Sell
          </button>
        </div>
      </section>

      {mode === 'buy' ? (
        <>
          <section className="container categories-section">
            <div className="section-title">
              <h2>Browse Categories</h2>
              <p>Explore our curated collections</p>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="category-card card">
                  <span className="category-icon">{cat.icon}</span>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {suggestions.length > 0 && (
            <section className="container suggestions-section">
              <div className="section-title">
                <h2>Recommended for You</h2>
                <p>Based on your browsing history</p>
              </div>
              <div className="grid-3">
                {suggestions.slice(0, 4).map((item) => (
                  <ListingCard key={item._id} listing={item} />
                ))}
              </div>
            </section>
          )}

          {recentViews.length > 0 && (
            <section className="container recent-section">
              <div className="section-title">
                <h2>Recently Viewed</h2>
                <p>Pick up where you left off</p>
              </div>
              <div className="grid-3">
                {recentViews.slice(0, 4).map((item) => (
                  <ListingCard key={item._id} listing={item} />
                ))}
              </div>
            </section>
          )}

          <section className="container listings-section">
            <div className="section-title">
              <h2>Latest Listings</h2>
              <p>Fresh arrivals for collectors and enthusiasts</p>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : listings.length === 0 ? (
              <div className="empty-state">
                <h3>No items listed yet</h3>
                <p>Be the first to list an item!</p>
                <Link to="/listings/new" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                  + Sell an Item
                </Link>
              </div>
            ) : (
              <div className="grid-3">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="container sell-section">
          <div className="sell-cta card">
            <div className="sell-cta-content">
              <h2>Ready to Sell?</h2>
              <p>List your vintage coins, special serial taka, old cameras, and collectibles for thousands of buyers to see.</p>
              <div className="sell-features">
                <div className="sell-feature">
                  <span className="sell-feature-icon">💰</span>
                  <div>
                    <h4>Set Your Price</h4>
                    <p>Fixed price or auction — you choose</p>
                  </div>
                </div>
                <div className="sell-feature">
                  <span className="sell-feature-icon">🌍</span>
                  <div>
                    <h4>Reach Collectors</h4>
                    <p>Your items seen by passionate buyers</p>
                  </div>
                </div>
                <div className="sell-feature">
                  <span className="sell-feature-icon">✅</span>
                  <div>
                    <h4>Secure Payments</h4>
                    <p>bKash and Nagad supported</p>
                  </div>
                </div>
              </div>
              <Link to="/listings/new" className="btn btn-primary btn-lg">Start Selling</Link>
              {user && (
                <Link to="/my-listings" className="btn btn-outline btn-lg" style={{ marginLeft: 12 }}>My Listings</Link>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
