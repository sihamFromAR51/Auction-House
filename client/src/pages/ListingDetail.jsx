import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listings as listingsApi, bids as bidsApi } from '../services/api';
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

  useEffect(() => {
    listingsApi.getById(id).then((res) => {
      setListing(res.data.listing);
      setBidAmount(res.data.listing.currentBid + (res.data.listing.bidIncrement || 0));
    }).catch(() => {
      navigate('/');
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await bidsApi.place(id, Number(bidAmount));
      setListing(data.listing);
      setBidAmount(data.listing.currentBid + data.listing.bidIncrement);
    } catch (err) {
      setError(err.response?.data?.message || 'Bid failed');
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${id}`);
  };

  if (loading) return <LoadingSpinner />;
  if (!listing) return null;

  const isSeller = user && listing.seller._id === user._id;
  const imgUrl = (idx) => getImageUrl(listing.images?.[idx]);

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
                <button
                  key={idx}
                  className={`thumb ${idx === currentImage ? 'active' : ''}`}
                  onClick={() => setCurrentImage(idx)}
                >
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

          <div className="listing-detail-seller">
            <span>Seller: <strong>{listing.seller?.name}</strong></span>
            <span className={`badge badge-${listing.status}`}>{listing.status}</span>
          </div>

          {listing.type === 'fixed' ? (
            <div className="listing-detail-price-section">
              <span className="listing-detail-price-label">Price</span>
              <span className="listing-detail-price">BDT {listing.price?.toLocaleString()}</span>
              {listing.status === 'active' && !isSeller && (
                <button onClick={handleBuyNow} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Buy Now
                </button>
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
                    <input
                      type="number"
                      className="form-input"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={listing.currentBid + listing.bidIncrement}
                      step={listing.bidIncrement}
                      required
                    />
                    <button type="submit" className="btn btn-primary">Place Bid</button>
                  </div>
                  <span className="form-hint">Min bid: BDT {(listing.currentBid + listing.bidIncrement).toLocaleString()}</span>
                </form>
              )}
              {listing.status === 'active' && !isSeller && !user && (
                <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', textAlign: 'center', marginTop: 16 }}>
                  Sign in to Bid
                </Link>
              )}
              {isSeller && (
                <p className="listing-detail-note">You are the seller of this item.</p>
              )}
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

          <div className="listing-detail-description">
            <h4>Description</h4>
            <p>{listing.description}</p>
          </div>

          <div className="listing-detail-meta">
            <span>Listed on {new Date(listing.createdAt).toLocaleDateString()}</span>
            {listing.endDate && (
              <span>Ends on {new Date(listing.endDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
