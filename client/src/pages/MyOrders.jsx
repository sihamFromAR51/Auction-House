import { useState, useEffect } from 'react';
import { orders as ordersApi } from '../services/api';
import { imageUrl } from '../config';
import LoadingSpinner from '../components/LoadingSpinner';
import './MyOrders.css';

const statusColors = {
  pending: 'badge-active',
  paid: 'badge-sold',
  shipped: 'badge-active',
  delivered: 'badge-sold',
  cancelled: 'badge-ended',
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [tab, setTab] = useState('purchases');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ordersRes, salesRes] = await Promise.all([
          ordersApi.getMy(),
          ordersApi.getSales(),
        ]);
        setOrders(ordersRes.data.orders);
        setSales(salesRes.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await ordersApi.updateStatus(id, status);
      const res = await ordersApi.getSales();
      setSales(res.data.orders);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const data = tab === 'purchases' ? orders : sales;

  return (
    <div className="container my-orders">
      <h2>{tab === 'purchases' ? 'My Orders' : 'Sales'}</h2>

      <div className="orders-tabs">
        <button className={`orders-tab ${tab === 'purchases' ? 'active' : ''}`} onClick={() => setTab('purchases')}>
          Purchases ({orders.length})
        </button>
        <button className={`orders-tab ${tab === 'sales' ? 'active' : ''}`} onClick={() => setTab('sales')}>
          Sales ({sales.length})
        </button>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <h3>No {tab} yet</h3>
          <p>Your {tab} will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {data.map((order) => (
            <div key={order._id} className="order-card card">
              <div className="order-card-image">
                {order.listing?.images?.[0] ? (
                  <img src={imageUrl(order.listing.images[0])} alt="" />
                ) : (
                  <div className="order-card-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="4" width="12" height="14" rx="2" />
                      <rect x="10" y="18" width="4" height="4" rx="1" />
                      <path d="M8 2h8" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="order-card-info">
                <h4>{order.listing?.title || 'Listing'}</h4>
                <div className="order-card-meta">
                  <span className="order-card-seller">
                    {tab === 'purchases' ? `Seller: ${order.seller?.name}` : `Buyer: ${order.buyer?.name}`}
                  </span>
                  <span className="order-card-amount">BDT {order.amount?.toLocaleString()}</span>
                </div>
                <div className="order-card-footer">
                  <span className={`badge ${statusColors[order.status] || 'badge-active'}`}>{order.status}</span>
                  <span className="order-card-payment">{order.paymentMethod} - {order.paymentNumber}</span>
                  <span className="order-card-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {tab === 'sales' && order.status === 'pending' && (
                  <div className="order-card-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatus(order._id, 'paid')}>
                      Mark Paid
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleStatus(order._id, 'cancelled')}>
                      Cancel
                    </button>
                  </div>
                )}
                {tab === 'sales' && order.status === 'paid' && (
                  <div className="order-card-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatus(order._id, 'shipped')}>
                      Mark Shipped
                    </button>
                  </div>
                )}
                {tab === 'sales' && order.status === 'shipped' && (
                  <div className="order-card-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatus(order._id, 'delivered')}>
                      Mark Delivered
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
