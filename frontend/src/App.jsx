import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/loginpage';
import Register from './pages/registerpage';
import Dashboard from './pages/Dashboard';
import MyBooks from './pages/MyBooks'; 
import AddBook from './pages/addbook'; 
import Profile from './pages/Profile'; 
import BookDetails from './pages/BookDetails';
import Navbar from './components/Navbar';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import WriteReview from './pages/WriteReview';
import PurchasedBooks from './pages/PurchasedBooks';

function App() {
  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Only accessible if logged in) */}
        <Route 
          path="/Dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/my-books" 
          element={isAuthenticated ? <MyBooks /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/purchased-books" 
          element={isAuthenticated ? <PurchasedBooks /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/write-review/:bookId" 
          element={isAuthenticated ? <WriteReview /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/book/:id" 
          element={isAuthenticated ? <BookDetails /> : <Navigate to="/login" />} 
        />
        <Route 
         path="/wishlist" 
         element={isAuthenticated ? <Wishlist /> : <Navigate to="/login" />} 
       />
        <Route 
          path="/addbook" 
          element={isAuthenticated ? <AddBook /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/checkout/:id" 
          element={isAuthenticated ? <Checkout /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/Dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;