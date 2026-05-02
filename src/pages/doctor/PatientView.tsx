import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldAlert, User, FileText, ExternalLink, Calendar, MapPin, Activity } from 'lucide-react';

interface PatientData {
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  address: string;
  isSharingEnabled: boolean;
}

interface Record {
  id: string;
  type: 'prescription' | 'report';
  fileName: string;
  fileURL: string;
  createdAt: any;
}

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;
      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        
        if (!patientDoc.exists()) {
          setDenied(true);
          return;
        }

        const data = patientDoc.data() as PatientData;
        
        if (!data.isSharingEnabled) {
          setDenied(true);
          setPatient(data); // Still keep profile for name if needed, but logic says deny
          return;
        }

        setPatient(data);

        // Fetch records
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const recordsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Record[];
        setRecords(recordsData);

      } catch (err) {
        console.error(err);
        setDenied(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) return <div className="flex justify-center p-20">Loading Data...</div>;

  if (denied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 max-w-xs">
          This patient has disabled data sharing. Please ask them to enable sharing in their MedVault dashboard.
        </p>
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="mt-8 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Patient Profile</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient?.name}</h2>
            <p className="text-blue-600 font-medium text-sm">{patient?.gender} • {patient?.age} yrs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <Activity size={14} />
              <span className="text-xs font-medium">Blood Group</span>
            </div>
            <p className="font-bold text-gray-900">{patient?.bloodGroup}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl">
            <div className="flex items-center space-x-2 text-gray-500 mb-1">
              <MapPin size={14} />
              <span className="text-xs font-medium">Location</span>
            </div>
            <p className="font-bold text-gray-900 line-clamp-1">{patient?.address}</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-2">Medical Timeline</h3>
        {records.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500">No medical records available for this patient.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${record.type === 'prescription' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 capitalize">{record.type}</h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <Calendar size={12} />
                      <span>{record.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <a 
                  href={record.fileURL} 
                  target="_blank" 
                  rel="no-referrer"
                  className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
