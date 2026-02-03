import React, { useEffect, useState } from 'react';
import api from '../../utils/Api';
import { Award, Download } from 'lucide-react';

const StudentCertificates = () => {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    api.get('/student/certificates').then(res => setCerts(res.data.data));
  }, []);

  const handleDownload = async (courseId) => {
    try {
      const response = await api.get(`/student/certificates/${courseId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Certificates</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certs.map(cert => (
          <div key={cert.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
            <img src={cert.thumbnail || '/placeholder-course.png'} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 truncate">{cert.courseTitle}</h3>
              <p className="text-gray-500 text-sm mb-4">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
              <button 
                onClick={() => handleDownload(cert.courseId)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primaryHover"
              >
                <Download size={18} /> Download PDF
              </button>
            </div>
          </div>
        ))}
        {certs.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
            <Award className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-500">You haven't earned any certificates yet. Keep learning!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCertificates;