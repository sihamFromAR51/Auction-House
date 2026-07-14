import { useState } from 'react';
import { Link } from 'react-router-dom';
import BidTimer from './BidTimer';
import { imageUrl as getImageUrl } from '../config';
import './ListingCard.css';

export default function ListingCard({ listing }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = getImageUrl(listing.images?.[0]);

  return (
    <Link to={`/listings/${listing._id}`} className="listing-card card">
      <div className="listing-card-image">
        {imgUrl && !imgError ? (
          <img src={imgUrl} alt={listing.title} onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="listing-card-placeholder">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
            </svg>
          </div>
        )}
        <div className="listing-card-badges">
          <span className={`badge badge-${listing.status}`}>{listing.status}</span>
          {listing.type === 'auction' && <span className="badge badge-auction">Auction</span>}
        </div>
      </div>
      <div className="listing-card-body">
        <span className="listing-card-category">{listing.category?.name}</span>
        <h3 className="listing-card-title">{listing.title}</h3>
        <div className="listing-card-meta">
          {listing.type === 'fixed' ? (
            <div className="listing-card-price">
              <span className="listing-card-label">Price</span>
              <span className="listing-card-value">BDT {listing.price?.toLocaleString()}</span>
            </div>
          ) : (
            <>
              <div className="listing-card-price">
                <span className="listing-card-label">Current Bid</span>
                <span className="listing-card-value">BDT {listing.currentBid?.toLocaleString()}</span>
              </div>
              <BidTimer endDate={listing.endDate} />
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
