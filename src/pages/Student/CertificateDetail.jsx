import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/Api';
import { Download, ChevronLeft } from 'lucide-react';

const CertificateDetail = () => {
  const { courseId } = useParams();
  const [cert, setCert] = useState(null);

  useEffect(() => {
    api.get(`/student/certificates`).then(res => {
      const found = res.data.data.find(c => c.courseId === courseId);
      setCert(found);
    });
  }, [courseId]);

  if (!cert) return <div className="p-10 text-center">Loading certificate details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black">
        <ChevronLeft size={20} /> Back to My Certificates
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center border-b border-gray-50">
          <h1 className="text-3xl font-bold text-gray-900">{cert.courseTitle}</h1>
          <p className="text-gray-500 mt-2">Earned on {new Date(cert.issuedAt).toLocaleDateString()}</p>
        </div>

        {/* Certificate Preview Placeholder */}
        <div className="bg-gray-50 p-12 flex justify-center">
          <div className="w-full max-w-2xl aspect-[1.414/1] bg-white shadow-2xl border-[12px] border-double border-primary/20 flex flex-col items-center justify-center p-8 relative">
            <div className="absolute top-4 left-4 text-primary opacity-20"><Award size={64} /></div>
            <h2 className="text-primary font-serif text-4xl mb-4">Certificate of Completion</h2>
            <p className="italic text-gray-600">This is presented to</p>
            <p className="text-2xl font-bold my-4 border-b-2 border-gray-200 pb-2 px-10">Your Name</p>
            <p className="text-center text-gray-600 max-w-sm">For demonstrating exceptional dedication and mastery in completing the course "{cert.courseTitle}"</p>
          </div>
        </div>

        <div className="p-6 bg-white flex justify-center">
          <button 
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg"
            onClick={() => handleDownload(courseId)} 
          >
            <Download size={20} /> Download Official PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetail;