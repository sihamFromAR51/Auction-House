import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { listings as listingsApi, categories as categoriesApi } from '../services/api';
import { FALLBACK_CATEGORIES } from '../categories';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './CategoryPage.css';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let cat = null;
      if (searchQuery) {
        cat = { _id: '', name: 'Search Results', slug: '', description: `Showing results for "${searchQuery}"` };
      } else {
        const catRes = await categoriesApi.getBySlug(slug);
        cat = catRes.data.category;
      }
      setCategory(cat);
      const listRes = await listingsApi.getAll({
        category: searchQuery ? undefined : cat._id,
        search: searchQuery || undefined,
        sort,
        limit: 50,
      });
      setListings(listRes.data.listings);
      setLoading(false);
    };
    fetch();
  }, [slug, sort, searchQuery]);

  return (
    <div className="container category-page">
      <div className="category-page-header">
        <div>
          <h2>{searchQuery ? `Search: "${searchQuery}"` : (category?.name || 'Category')}</h2>
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
          <h3>{searchQuery ? 'No results found' : 'No items in this category'}</h3>
          <p>{searchQuery ? `Try a different search term` : 'Check back later for new listings.'}</p>
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
