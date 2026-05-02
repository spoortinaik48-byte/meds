import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, User, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-50 md:top-0 md:bottom-auto">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <Link to={userData?.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} className="flex flex-col items-center text-blue-600">
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-center text-gray-500">
            <ShieldCheck size={24} />
            <span className="text-xs mt-1">Vault</span>
          </div>
          <button onClick={handleLogout} className="flex flex-col items-center text-gray-500">
            <LogOut size={24} />
            <span className="text-xs mt-1">Exit</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
