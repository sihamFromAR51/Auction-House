import { Link } from 'react-router-dom';
import BidTimer from './BidTimer';
import { imageUrl as getImageUrl } from '../config';
import './ListingCard.css';

export default function ListingCard({ listing }) {
  const imgUrl = getImageUrl(listing.images?.[0]);

  return (
    <Link to={`/listings/${listing._id}`} className="listing-card card">
      <div className="listing-card-image">
        {imgUrl ? (
          <img src={imgUrl} alt={listing.title} />
        ) : (
          <div className="listing-card-placeholder">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="12" height="14" rx="2" />
              <rect x="10" y="18" width="4" height="4" rx="1" />
              <path d="M8 2h8" />
            </svg>
          </div>
        )}
        <span className={`badge badge-${listing.status}`}>{listing.status}</span>
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
