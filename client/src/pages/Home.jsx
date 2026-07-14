import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { listings as listingsApi, categories as categoriesApi } from '../services/api';
import { FALLBACK_CATEGORIES } from '../categories';
import './Home.css';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [listingsRes, categoriesRes] = await Promise.all([
          listingsApi.getAll({ limit: 9 }),
          categoriesApi.getAll(),
        ]);
        setListings(listingsRes.data.listings);
        setCategories(categoriesRes.data.categories);
      } catch (err) {
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <>
      <HeroBanner />

      <section className="container categories-section">
        <div className="section-title">
          <h2>Browse Categories</h2>
          <p>Explore our curated collections</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/category/${cat.slug}`} className="category-card card">
              <span className="category-icon">
                {cat.slug === 'vintage-coins' && '\u{1FA99}'}
                {cat.slug === 'special-serial-taka' && '\u{1F4B5}'}
                {cat.slug === 'old-cameras' && '\u{1F4F7}'}
              </span>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container listings-section">
        <div className="section-title">
          <h2>Latest Listings</h2>
          <p>Fresh arrivals for collectors and enthusiasts</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <h3>No listings yet</h3>
            <p>Be the first to list an item!</p>
            <Link to="/listings/new" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Create Listing
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
  );
}
