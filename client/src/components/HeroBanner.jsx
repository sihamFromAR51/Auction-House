import { Link } from 'react-router-dom';
import './HeroBanner.css';

export default function HeroBanner() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-pattern" />
      <div className="container hero-content">
        <div className="hero-badge">Premium Auction House</div>
        <h1 className="hero-title">
          Where <span className="hero-accent">Rare Finds</span><br />
          Find New Homes
        </h1>
        <div className="hero-divider" />
        <p className="hero-subtitle">
          From vintage coins and rare banknotes to classic cameras — AuctionHouse connects passionate collectors with extraordinary pieces.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">Start Bidding</Link>
          <Link to="/category/vintage-coins" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
            Explore Collections
          </Link>
        </div>
      </div>
    </section>
  );
}
