import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { ChevronLeft, FileText, ExternalLink, Calendar, Filter } from 'lucide-react';

interface Record {
  id: string;
  type: 'prescription' | 'report';
  fileName: string;
  fileURL: string;
  createdAt: any;
}

export default function PatientTimeline() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Record[];
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Medical Timeline</h1>
        </div>
        <button className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500">
          <Filter size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">Loading Records...</div>
      ) : records.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-500">No records found. Upload your first medical document.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={record.id}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${record.type === 'prescription' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 capitalize">{record.type}</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <Calendar size={12} />
                    <span>{record.createdAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <a 
                href={record.fileURL} 
                target="_blank" 
                rel="no-referrer"
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all"
              >
                <ExternalLink size={18} />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
