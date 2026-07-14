import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listings as listingsApi, orders as ordersApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [listRes, salesRes] = await Promise.all([
          listingsApi.getMy(),
          ordersApi.getSales(),
        ]);
        setListings(listRes.data.listings);
        setSales(salesRes.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  const activeListings = listings.filter((l) => l.status === 'active');
  const pendingOrders = sales.filter((o) => o.status === 'pending');

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Welcome, {user?.name}</h2>
          <p className="dashboard-subtitle">Manage your auctions and orders</p>
        </div>
        <Link to="/listings/new" className="btn btn-primary">+ Create Listing</Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card card">
          <span className="stat-value">{activeListings.length}</span>
          <span className="stat-label">Active Listings</span>
        </div>
        <div className="stat-card card">
          <span className="stat-value">{pendingOrders.length}</span>
          <span className="stat-label">Pending Orders</span>
        </div>
        <div className="stat-card card">
          <span className="stat-value">{listings.length}</span>
          <span className="stat-label">Total Listings</span>
        </div>
      </div>

      <div className="dashboard-links">
        <Link to="/my-listings" className="card dashboard-link-card">
          <h4>My Listings</h4>
          <p>View and manage all your listed items</p>
        </Link>
        <Link to="/my-orders" className="card dashboard-link-card">
          <h4>My Orders</h4>
          <p>Track items you've purchased</p>
        </Link>
        <Link to="/my-orders" className="card dashboard-link-card">
          <h4>Sales</h4>
          <p>Items sold to other buyers</p>
        </Link>
      </div>
    </div>
  );
}
