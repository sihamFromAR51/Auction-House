import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import CategoryPage from './pages/CategoryPage';
import Checkout from './pages/Checkout';
import MyListings from './pages/MyListings';
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listings/new" element={<CreateListing />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/checkout/:listingId" element={<Checkout />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
