import { useState, useEffect } from "react";
import axios from "axios";
import ProfileSidebar from "../../components/ProfileSidebar";

export default function EditPhoto() {
  const user = JSON.parse(localStorage.getItem("user"));
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [preview, setPreview] = useState(user?.photo_url || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Optional: refresh preview if user changes elsewhere
  useEffect(() => {
    setPreview(user?.photo_url || "");
  }, [user?.photo_url]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

const token = user?.token || localStorage.getItem("accessToken");

const handleUpload = async () => {
  if (!file) {
    alert("Please select an image first");
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await axios.post(
      `${API_URL}/users/upload-photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.setItem("user", JSON.stringify(res.data));

    alert("Photo updated successfully");
    setPreview(res.data.photo_url);
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    alert("Upload failed — check console");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-7xl mx-auto flex">
      {/* LEFT SIDEBAR */}
      <ProfileSidebar />

      {/* RIGHT CONTENT */}
      <div className="flex-1 px-10 py-10">
        <h1 className="text-2xl font-bold mb-6">Photo</h1>
        <p className="text-gray-600 mb-6">
          Add a nice photo of yourself for your profile.
        </p>

        {/* IMAGE PREVIEW */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">Image preview</h2>

          <div className="flex justify-center mb-6">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-40 rounded-full object-cover border"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl">
                ?
              </div>
            )}
          </div>

          {/* FILE INPUT */}
          <div className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
            />

            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
