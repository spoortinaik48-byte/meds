import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { User, FileUp, List, Settings, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function PatientDashboard() {
  const { userData, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [sharingLoading, setSharingLoading] = useState(false);

  const toggleSharing = async () => {
    if (!userData) return;
    setSharingLoading(true);
    try {
      const newStatus = !userData.isSharingEnabled;
      const path = `users/${userData.uid}`;
      try {
        await updateDoc(doc(db, 'users', userData.uid), {
          isSharingEnabled: newStatus,
          updatedAt: new Date().toISOString()
        });
        await refreshUserData();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharingLoading(false);
    }
  };

  if (!userData) return null;

  const patientUrl = `${window.location.origin}/doctor/patient/${userData.uid}`;

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {userData.name.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm">{userData.bloodGroup} • {userData.age} years</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
          <User size={24} />
        </div>
      </motion.div>

      <QRCodeDisplay value={patientUrl} />

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/patient/upload')}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center space-y-3 hover:bg-blue-50 transition-colors"
        >
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 font-bold">
             <FileUp size={24} />
          </div>
          <span className="font-bold text-gray-700">Upload</span>
        </button>
        <button 
          onClick={() => navigate('/patient/timeline')}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center space-y-3 hover:bg-blue-50 transition-colors"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-bold">
             <List size={24} />
          </div>
          <span className="font-bold text-gray-700">Timeline</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-800">Privacy Control</h3>
            {userData.isSharingEnabled ? (
              <ShieldCheck size={18} className="text-green-500" />
            ) : (
              <ShieldAlert size={18} className="text-red-500" />
            )}
          </div>
          <button 
            onClick={toggleSharing}
            disabled={sharingLoading}
            className={`w-12 h-6 rounded-full transition-all relative ${userData.isSharingEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${userData.isSharingEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          {userData.isSharingEnabled 
            ? "Doctors can view your records by scanning your QR code. Your data is currently accessible."
            : "Data sharing is disabled. Doctors will see 'Access Denied' even if they have your ID."}
        </p>
      </div>
    </div>
  );
}
