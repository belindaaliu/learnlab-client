import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, ShieldCheck } from "lucide-react";

const VerifyCertificate = () => {
  const { certId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/public/verify-certificate/${certId}`,
      )
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, [certId]);

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <XCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Invalid Certificate</h1>
        <p className="text-gray-500">
          This certificate ID could not be verified in our records.
        </p>
      </div>
    );

  if (!data) return <div className="text-center p-20">Verifying...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border-t-8 border-primary">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <ShieldCheck size={48} className="text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          Verified Certificate
        </h1>
        <p className="text-center text-gray-500 mb-8">
          This document is authentic and issued by our platform.
        </p>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
              Student
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {data.data.studentName}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
              Course
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {data.data.courseTitle}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
              Issue Date
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(data.data.issuedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-green-600 font-bold">
          <CheckCircle size={20} />
          <span>Officially Verified</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
