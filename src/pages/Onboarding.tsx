import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { User, Mail, MapPin, Hash, Activity, Award } from 'lucide-react';

export default function Onboarding() {
  const { user, userData, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    address: '',
    degree: '',
  });

  useEffect(() => {
    if (userData?.onboarded) {
      navigate(userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    }
  }, [userData, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        address: formData.address,
        onboarded: true,
        updatedAt: new Date().toISOString()
      };

      if (userData?.role === 'patient') {
        updateData.age = formData.age;
        updateData.gender = formData.gender;
        updateData.bloodGroup = formData.bloodGroup;
        updateData.isSharingEnabled = true; // Default to ON
      } else {
        updateData.degree = formData.degree;
      }

      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), updateData);
        await refreshUserData();
        navigate(userData?.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full text-left mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Complete Profile</h1>
        <p className="text-gray-500 mt-1">Help us personalize your experience.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div className="bg-white p-6 rounded-3xl space-y-4 shadow-sm border border-gray-100">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="text-blue-500" />
              <span>Full Name</span>
            </label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="Ex: Dr. John Smith"
            />
          </div>

          {userData?.role === 'patient' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                    <Hash size={16} className="text-blue-500" />
                    <span>Age</span>
                  </label>
                  <input 
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="24"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                    <Activity size={16} className="text-blue-500" />
                    <span>Blood Group</span>
                  </label>
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                  <span>Gender</span>
                </label>
                <div className="flex space-x-2">
                  {['Male', 'Female', 'Other'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${formData.gender === g ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-500'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <Award size={16} className="text-blue-500" />
                <span>Specialization / Degree</span>
              </label>
              <input 
                required
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                placeholder="Ex: MBBS, Cardiology"
              />
            </div>
          )}

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} className="text-blue-500" />
              <span>Full Address</span>
            </label>
            <textarea 
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
              placeholder="Avenue Road, Bangalore..."
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-blue-200"
        >
          {loading ? 'Saving...' : 'Finalize Profile'}
        </button>
      </form>
    </div>
  );
}
