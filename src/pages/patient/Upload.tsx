import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';

export default function PatientUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    try {
      const storageRef = ref(storage, `records/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'records'), {
        patientId: user.uid,
        fileURL: url,
        fileName: file.name,
        type,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 2000);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please check your storage bucket permissions.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Upload Record</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,.pdf"
          />
          <div className={`p-4 rounded-2xl ${file ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <Upload size={32} />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-700">{file ? file.name : "Tap to upload"}</p>
            <p className="text-xs text-gray-500 mt-1">PDF or Images up to 5MB</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Record Type</label>
          <div className="flex space-x-2">
            <button 
              onClick={() => setType('prescription')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-medium transition-all ${type === 'prescription' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-500'}`}
            >
              <FileText size={18} />
              <span>Prescription</span>
            </button>
            <button 
              onClick={() => setType('report')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-medium transition-all ${type === 'report' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-500'}`}
            >
              <FileText size={18} />
              <span>Medical Report</span>
            </button>
          </div>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || uploading || success}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : success ? (
            <>
              <CheckCircle2 size={24} />
              <span>Uploaded!</span>
            </>
          ) : (
            <span>Confirm Upload</span>
          )}
        </button>
      </div>
    </div>
  );
}
