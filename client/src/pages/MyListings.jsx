import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listings as listingsApi } from '../services/api';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './MyListings.css';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.getMy().then((res) => {
      setListings(res.data.listings);
    }).catch(() => {}).finally(() => {
      setLoading(false);
    });
  }, []);

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
        <div className="grid-3">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
