import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users as usersApi, reviews as reviewsApi, listings as listingsApi } from '../services/api';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './SellerProfile.css';

export default function SellerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [userRes, reviewsRes, listRes] = await Promise.all([
          usersApi.getProfile(id),
          reviewsApi.getBySeller(id),
          listingsApi.getAll({ limit: 20 }),
        ]);
        setProfile(userRes.data.user);
        setReviews(reviewsRes.data.reviews || []);
        const sellerListings = (listRes.data.listings || []).filter((l) => l.seller === id || l.seller?._id === id);
        setListings(sellerListings);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="container empty-state"><h3>Seller not found</h3></div>;

  const rating = profile.rating || (reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0);
  const isVerified = reviews.length >= 2;
  const isTopSeller = reviews.length >= 5 && rating >= 4;

  return (
    <div className="container seller-profile">
      <div className="seller-profile-header card">
        <div className="seller-avatar">
          {profile.name?.charAt(0).toUpperCase()}
        </div>
        <div className="seller-info">
          <div className="seller-name-row">
            <h2>{profile.name}</h2>
            {isVerified && <span className="seller-badge verified" title="Verified Seller">{'\u2713'} Verified</span>}
            {isTopSeller && <span className="seller-badge top-seller" title="Top Seller">{'\u2B50'} Top Seller</span>}
          </div>
          <div className="seller-meta">
            <span className="seller-rating">
              {'\u2B50'} {rating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
            <span className="seller-joined">Member since {new Date(profile.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <section className="seller-reviews-section">
          <h3>Reviews ({reviews.length})</h3>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card card">
                <div className="review-header">
                  <span className="review-author">{review.buyerName || 'Anonymous'}</span>
                  <span className="review-rating">{'\u2B50'.repeat(review.rating)}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {listings.length > 0 && (
        <section className="seller-listings-section">
          <h3>Active Listings ({listings.length})</h3>
          <div className="grid-3">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
