import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listings as listingsApi } from '../services/api';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './MyListings.css';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    listingsApi.getMy().then((res) => {
      setListings(res.data.listings);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(id);
    try {
      await listingsApi.delete(id);
      setListings(listings.filter((l) => l._id !== id));
    } catch (err) {
      alert('Failed to delete listing');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container my-listings">
      <div className="my-listings-header">
        <h2>My Listings</h2>
        <Link to="/listings/new" className="btn btn-primary">+ New Listing</Link>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <h3>No listings yet</h3>
          <p>Create your first listing to start selling.</p>
          <Link to="/listings/new" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="my-listings-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="my-listing-item">
              <ListingCard listing={listing} />
              <div className="my-listing-actions">
                <span className={`badge ${listing.status === 'active' ? 'badge-active' : 'badge-sold'}`}>
                  {listing.status}
                </span>
                {listing.status === 'active' && (
                  <>
                    <Link to={`/listings/${listing._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--color-error)', borderColor: 'rgba(220,38,38,0.3)' }}
                      onClick={() => handleDelete(listing._id)}
                      disabled={deleting === listing._id}
                    >
                      {deleting === listing._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
