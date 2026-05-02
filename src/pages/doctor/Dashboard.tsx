import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { Search, QrCode, User, HeartPulse, ClipboardList } from 'lucide-react';

export default function DoctorDashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  if (!userData) return null;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <HeartPulse size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Respected {userData.name}</h1>
            <p className="text-blue-100 text-sm font-medium">{userData.degree}</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search Patient ID..."
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full bg-white/10 border border-white/20 backdrop-blur-md px-6 py-4 rounded-2xl outline-none placeholder:text-blue-100 focus:bg-white/20 transition-all font-medium pr-12"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-1">
            <Search size={22} />
          </button>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Scan QR Code</h3>
              <p className="text-xs text-gray-500">Scan patient's MedVault QR</p>
            </div>
          </div>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-100 active:scale-95 transition-all">
            Scan
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Recent Patients</h3>
              <p className="text-xs text-gray-500">View your session history</p>
            </div>
          </div>
          <div className="text-gray-300">
             <Search size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
