import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listings as listingsApi, bids as bidsApi, reviews as reviewsApi } from '../services/api';
import { imageUrl as getImageUrl } from '../config';
import BidTimer from '../components/BidTimer';
import LoadingSpinner from '../components/LoadingSpinner';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await listingsApi.getById(id);
        setListing(res.data.listing);
        setBidAmount(res.data.listing.currentBid + (res.data.listing.bidIncrement || 0));
        try {
          const revRes = await reviewsApi.getBySeller(res.data.listing.seller?._id);
          setReviews(revRes.data.reviews || []);
        } catch {}
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await bidsApi.place(id, Number(bidAmount));
      setListing(data.listing);
      setBidAmount(data.listing.currentBid + data.listing.bidIncrement);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Bid failed');
    }
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/checkout/${id}`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await reviewsApi.create({
        sellerId: listing.seller._id,
        listingId: listing._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      const revRes = await reviewsApi.getBySeller(listing.seller._id);
      setReviews(revRes.data.reviews || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!listing) return null;

  const isSeller = user && listing.seller?._id === user._id;
  const imgUrl = (idx) => getImageUrl(listing.images?.[idx]);
  const sellerRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const isVerified = reviews.length >= 2;

  return (
    <div className="container listing-detail">
      <div className="listing-detail-grid">
        <div className="listing-detail-gallery">
          <div className="listing-detail-main-image">
            {imgUrl(currentImage) ? (
              <img src={imgUrl(currentImage)} alt={listing.title} />
            ) : (
              <div className="listing-detail-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="12" height="14" rx="2" />
                  <rect x="10" y="18" width="4" height="4" rx="1" />
                  <path d="M8 2h8" />
                </svg>
              </div>
            )}
          </div>
          {listing.images?.length > 1 && (
            <div className="listing-detail-thumbnails">
              {listing.images.map((_, idx) => (
                <button key={idx} className={`thumb ${idx === currentImage ? 'active' : ''}`} onClick={() => setCurrentImage(idx)}>
                  <img src={getImageUrl(listing.images[idx])} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="listing-detail-info">
          <span className="listing-detail-category">
            <Link to={`/category/${listing.category?.slug}`}>{listing.category?.name}</Link>
          </span>
          <h1 className="listing-detail-title">{listing.title}</h1>

          <Link to={`/seller/${listing.seller?._id}`} className="listing-detail-seller card">
            <div className="seller-avatar-sm">
              {listing.seller?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="seller-info-sm">
              <div className="seller-name-sm">
                <strong>{listing.seller?.name}</strong>
                {isVerified && <span className="badge-verified-sm">{'\u2713'} Verified</span>}
              </div>
              <span className="seller-rating-sm">{'\u2B50'} {sellerRating} ({reviews.length})</span>
            </div>
            <svg className="seller-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </Link>

          {listing.type === 'fixed' ? (
            <div className="listing-detail-price-section">
              <span className="listing-detail-price-label">Price</span>
              <span className="listing-detail-price">BDT {listing.price?.toLocaleString()}</span>
              {listing.status === 'active' && !isSeller && (
                <button onClick={handleBuyNow} className="btn btn-primary btn-lg" style={{ width: '100%' }}>Buy Now</button>
              )}
            </div>
          ) : (
            <div className="listing-detail-bid-section">
              <div className="bid-stats">
                <div>
                  <span className="listing-detail-price-label">Current Bid</span>
                  <span className="listing-detail-price">BDT {listing.currentBid?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="listing-detail-price-label">Starting Bid</span>
                  <span>BDT {listing.startingBid?.toLocaleString()}</span>
                </div>
                <BidTimer endDate={listing.endDate} />
              </div>

              {listing.bids?.length > 0 && (
                <div className="bid-history">
                  <h4>Bid History ({listing.bids.length})</h4>
                  <div className="bid-history-list">
                    {[...listing.bids].reverse().slice(0, 10).map((bid, i) => (
                      <div key={i} className="bid-history-item">
                        <span>{bid.bidder?.name || 'Anonymous'}</span>
                        <span className="bid-history-amount">BDT {bid.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {listing.status === 'active' && !isSeller && user && (
                <form onSubmit={handleBid} className="bid-form">
                  <div className="bid-input-group">
                    <input type="number" className="form-input" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                      min={listing.currentBid + listing.bidIncrement} step={listing.bidIncrement} required />
                    <button type="submit" className="btn btn-primary">Place Bid</button>
                  </div>
                  <span className="form-hint">Min bid: BDT {(listing.currentBid + listing.bidIncrement).toLocaleString()}</span>
                </form>
              )}
              {listing.status === 'active' && !isSeller && !user && (
                <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', textAlign: 'center', marginTop: 16 }}>Sign in to Bid</Link>
              )}
              {isSeller && <p className="listing-detail-note">You are selling this item.</p>}
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

          <div className="listing-detail-description">
            <h4>Description</h4>
            <p>{listing.description}</p>
          </div>

          <div className="listing-detail-meta">
            <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
            {listing.endDate && <span>Ends {new Date(listing.endDate).toLocaleDateString()}</span>}
          </div>

          {!isSeller && user && (
            <div className="listing-review-section">
              {!showReviewForm ? (
                <button className="btn btn-outline" onClick={() => setShowReviewForm(true)} style={{ width: '100%', marginTop: 20 }}>
                  Write a Review
                </button>
              ) : (
                <form onSubmit={handleReview} className="review-form">
                  <h4>Review Seller</h4>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div className="star-rating">
                      {[1,2,3,4,5].map((star) => (
                        <button key={star} type="button" className={`star ${star <= reviewForm.rating ? 'active' : ''}`}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}>{'\u2B50'}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea className="form-input" placeholder="Share your experience..." value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                  </div>
                  <div className="review-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowReviewForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {reviews.length > 0 && (
            <div className="listing-reviews">
              <h4>Seller Reviews ({reviews.length})</h4>
              {reviews.slice(0, 3).map((rev) => (
                <div key={rev._id} className="listing-review-item">
                  <div className="listing-review-header">
                    <span className="listing-review-author">{rev.buyerName || 'Anonymous'}</span>
                    <span className="listing-review-rating">{'\u2B50'.repeat(rev.rating)}</span>
                  </div>
                  {rev.comment && <p>{rev.comment}</p>}
                </div>
              ))}
              <Link to={`/seller/${listing.seller?._id}`} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
                View all reviews
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
