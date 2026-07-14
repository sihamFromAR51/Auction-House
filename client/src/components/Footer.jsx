import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/logo.svg" alt="AuctionHouse" className="footer-logo" />
        </div>
        <div className="footer-links">
          <Link to="/category/vintage-coins">Vintage Coins</Link>
          <Link to="/category/special-serial-taka">Special Serial Taka</Link>
          <Link to="/category/old-cameras">Old Cameras</Link>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} AuctionHouse. All rights reserved.</p>
      </div>
    </footer>
  );
}
