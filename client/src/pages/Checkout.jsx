import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listings as listingsApi, orders as ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './Checkout.css';

export default function Checkout() {
  const { listingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    paymentMethod: 'bkash',
    paymentNumber: '',
    transactionId: '',
    note: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    listingsApi.getById(listingId).then((res) => {
      setListing(res.data.listing);
    }).catch(() => {
      navigate('/');
    }).finally(() => {
      setLoading(false);
    });
  }, [listingId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await ordersApi.create({
        listingId,
        ...form,
      });
      navigate('/my-orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!listing) return null;

  const amount = listing.type === 'fixed' ? listing.price : listing.currentBid;

  return (
    <div className="container checkout">
      <div className="checkout-grid">
        <div className="checkout-summary card">
          <h3>Order Summary</h3>
          <div className="checkout-item">
            <span className="checkout-item-label">Item</span>
            <span>{listing.title}</span>
          </div>
          <div className="checkout-item">
            <span className="checkout-item-label">Seller</span>
            <span>{listing.seller?.name}</span>
          </div>
          <div className="checkout-item">
            <span className="checkout-item-label">Type</span>
            <span className="badge badge-active">{listing.type === 'fixed' ? 'Fixed Price' : 'Auction'}</span>
          </div>
          <div className="checkout-total">
            <span className="checkout-item-label">Total Amount</span>
            <span className="checkout-total-value">BDT {amount?.toLocaleString()}</span>
          </div>
        </div>

        <div className="checkout-form card">
          <h3>Payment Details</h3>
          <p className="checkout-form-subtitle">Complete your purchase with bKash or Nagad</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div className="payment-methods">
                <label className={`payment-method ${form.paymentMethod === 'bkash' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={form.paymentMethod === 'bkash'}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  />
                  <span className="payment-method-name">bKash</span>
                </label>
                <label className={`payment-method ${form.paymentMethod === 'nagad' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="nagad"
                    checked={form.paymentMethod === 'nagad'}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  />
                  <span className="payment-method-name">Nagad</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{form.paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="01XXXXXXXXX"
                value={form.paymentNumber}
                onChange={(e) => setForm({ ...form, paymentNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Transaction ID (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter transaction ID if paid"
                value={form.transactionId}
                onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea
                className="form-input"
                placeholder="Any message for the seller"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : `Pay BDT ${amount?.toLocaleString()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
