import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { users as usersApi, reviews as reviewsApi, listings as listingsApi } from '../services/api';
import { imageUrl } from '../config';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './SellerProfile.css';

export default function SellerProfile() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', location: '', website: '' });

  const isOwn = user && profile && user._id === profile._id;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [userRes, reviewsRes, listRes] = await Promise.all([
        usersApi.getProfile(id),
        reviewsApi.getBySeller(id),
        listingsApi.getAll({ seller: id, limit: 50 }),
      ]);
      setProfile(userRes.data.user);
      setReviews(reviewsRes.data.reviews || []);
      setListings(listRes.data.listings || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [id]);

  const openEdit = () => {
    setEditForm({ name: profile.name || '', bio: profile.bio || '', location: profile.location || '', website: profile.website || '' });
    setEditing(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await usersApi.updateProfile(id, editForm);
      if (isOwn && updateUser) updateUser(editForm);
      setProfile(res.data.user);
      setEditing(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const avatar = reader.result;
      try {
        const res = await usersApi.updateProfile(id, { avatar });
        if (isOwn && updateUser) updateUser({ avatar });
        setProfile(res.data.user);
      } catch { alert('Failed to update avatar'); }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="container empty-state"><h3>Seller not found</h3></div>;

  const rating = profile.rating || (reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0);
  const isVerified = reviews.length >= 2;
  const isTopSeller = reviews.length >= 5 && rating >= 4;
  const avatarUrl = imageUrl(profile.avatar);
  const coverUrl = imageUrl(profile.coverPhoto);
  const activeListings = listings.filter((l) => l.status === 'active');

  return (
    <div className="container seller-profile">
      <div className="seller-profile-card card">
        <div className="seller-cover" style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}>
          {isOwn && (
            <label className="cover-edit-btn" title="Change cover photo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => {}} />
            </label>
          )}
        </div>
        <div className="seller-profile-body">
          <div className="seller-avatar-section">
            <div className="seller-avatar" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              {!avatarUrl && profile.name?.charAt(0).toUpperCase()}
              {isOwn && (
                <label className="avatar-edit-overlay" title="Change photo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="seller-info-main">
            <div className="seller-name-badges">
              <h2>{profile.name}</h2>
              <div className="seller-badges">
                {isVerified && <span className="seller-badge verified">✓ Verified</span>}
                {isTopSeller && <span className="seller-badge top-seller">⭐ Top Seller</span>}
              </div>
            </div>

            <div className="seller-stats">
              <div className="seller-stat">
                <span className="seller-stat-value">{activeListings.length}</span>
                <span className="seller-stat-label">Listings</span>
              </div>
              <div className="seller-stat">
                <span className="seller-stat-value">{reviews.length}</span>
                <span className="seller-stat-label">Reviews</span>
              </div>
              <div className="seller-stat">
                <span className="seller-stat-value">{rating}</span>
                <span className="seller-stat-label">Rating</span>
              </div>
            </div>

            {profile.location && (
              <div className="seller-detail">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{profile.location}</span>
              </div>
            )}

            {profile.bio && <p className="seller-bio">{profile.bio}</p>}

            {profile.website && (
              <div className="seller-detail">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer">{profile.website}</a>
              </div>
            )}

            <div className="seller-detail">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Member since {new Date(profile.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>

            {isOwn && (
              <button className="btn btn-outline btn-sm" onClick={openEdit} style={{ marginTop: 12 }}>Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell buyers about yourself" rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="e.g. Dhaka, Bangladesh" />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} placeholder="e.g. example.com" />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <section className="seller-section">
          <h3>Reviews ({reviews.length})</h3>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card card">
                <div className="review-header">
                  <div className="review-avatar-sm">{review.buyerName?.charAt(0).toUpperCase() || '?'}</div>
                  <div className="review-header-info">
                    <span className="review-author">{review.buyerName || 'Anonymous'}</span>
                    <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeListings.length > 0 && (
        <section className="seller-section">
          <h3>Active Listings ({activeListings.length})</h3>
          <div className="grid-3">
            {activeListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
