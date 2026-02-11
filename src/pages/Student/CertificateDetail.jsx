import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/Api";
import { Download, ChevronLeft, Award, Linkedin, Share2 } from "lucide-react";
import CopyCertificateLink from "../../components/CopyCertificateLink";

const CertificateDetail = () => {
  const { courseId } = useParams();
  const [cert, setCert] = useState(null);

  useEffect(() => {
    api.get(`/student/certificates`).then((res) => {
      const found = res.data.data.find(
        (c) => c.courseId?.toString() === courseId.toString(),
      );
      setCert(found || null);
    });
  }, [courseId]);

  if (!cert) {
    return (
      <div className="p-10 text-center">
        No certificate found for this course.
      </div>
    );
  }

  const handleDownload = async (courseIdParam) => {
    try {
      const response = await api.get(
        `/student/certificates/${courseIdParam}/download`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate-${courseIdParam}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed");
    }
  };

  const addToLinkedInProfile = () => {
    if (!cert) return;
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME`;
    window.open(linkedInUrl, "_blank");
  };

  const shareToLinkedIn = () => {
    if (!cert) return;
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const certUrl = `${frontendUrl}/verify/${cert.id}`;
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      certUrl,
    )}`;
    window.open(linkedInShareUrl, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black"
      >
        <ChevronLeft size={20} /> Back to Course page
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center border-b border-gray-50">
          <h1 className="text-3xl font-bold text-gray-900">
            {cert.courseTitle}
          </h1>
          <p className="text-gray-500 mt-2">
            Earned on {new Date(cert.issuedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Certificate Preview (PDF) */}
        <div className="bg-gray-50 p-6 flex justify-center">
          <div className="w-full max-w-3xl h-[600px] border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/public/certificates/${cert.id}/download`}
              title="Certificate Preview"
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="p-6 bg-white flex justify-center">
          <button
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg"
            onClick={() => handleDownload(courseId)}
          >
            <Download size={20} /> Download Official PDF
          </button>

          {/* Add to LinkedIn Profile */}
          <button
            onClick={addToLinkedInProfile}
            className="flex items-center gap-2 bg-[#0077b5] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#005582] transition"
          >
            <Linkedin size={18} /> Add to LinkedIn Profile
          </button>

          {/* Share to Feed */}
          <button
            onClick={shareToLinkedIn}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition"
          >
            <Share2 size={18} /> Share to Feed
          </button>

          <CopyCertificateLink certId={cert.id} />
        </div>
      </div>
    </div>
  );
};

export default CertificateDetail;
