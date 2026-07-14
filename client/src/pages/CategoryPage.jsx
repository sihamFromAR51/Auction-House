import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listings as listingsApi, categories as categoriesApi } from '../services/api';
import { FALLBACK_CATEGORIES } from '../categories';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './CategoryPage.css';

export default function CategoryPage() {
  const { slug } = useParams();
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const catRes = await categoriesApi.getBySlug(slug);
        setCategory(catRes.data.category);
        const catId = catRes.data.category._id;

        const listRes = await listingsApi.getAll({
          category: catId,
          sort,
          limit: 50,
        });
        setListings(listRes.data.listings);
      } catch (err) {
        const fallback = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
        if (fallback) setCategory(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug, sort]);

  return (
    <div className="container category-page">
      <div className="category-page-header">
        <div>
          <h2>{category?.name || 'Category'}</h2>
          <p>{category?.description}</p>
        </div>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 160 }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="ending-soon">Ending Soon</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <h3>No items in this category</h3>
          <p>Check back later for new listings.</p>
        </div>
      ) : (
        <div className="grid-3">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
