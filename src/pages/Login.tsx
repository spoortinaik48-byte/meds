import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { Shield, User, HeartPulse, Chrome } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = async (user: any) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.onboarded) {
          navigate(userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        // Create profile for new social user or if doc doesn't exist
        const path = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            role: role, // Use selected role
            onboarded: false,
            createdAt: new Date().toISOString()
          });
          navigate('/onboarding');
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(result.user);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          role,
          onboarded: false,
          createdAt: new Date().toISOString()
        });
        navigate('/onboarding');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is not enabled in Firebase. Please enable it in the Firebase Console.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center mb-8"
      >
        <div className="inline-flex p-4 bg-blue-50 rounded-3xl mb-4">
          <Shield className="text-blue-600" size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">MedVault</h1>
        <p className="text-gray-500 mt-2">Your health records, anywhere.</p>
      </motion.div>

      <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setRole('patient')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-sm font-medium transition-all ${role === 'patient' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            <User size={18} />
            <span>Patient</span>
          </button>
          <button 
            onClick={() => setRole('doctor')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-sm font-medium transition-all ${role === 'doctor' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            <HeartPulse size={18} />
            <span>Doctor</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="name@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
          </button>
        </form>

        <div className="mt-4 flex items-center space-x-2">
          <div className="flex-1 h-[1px] bg-gray-200"></div>
          <span className="text-gray-400 text-xs font-medium">OR</span>
          <div className="flex-1 h-[1px] bg-gray-200"></div>
        </div>

        <button 
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full mt-4 bg-white border border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Chrome size={20} className="text-gray-600" />
          <span>Continue with Google</span>
        </button>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 text-sm font-medium underline underline-offset-4"
          >
            {isLogin ? "Need an account? Signup" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
