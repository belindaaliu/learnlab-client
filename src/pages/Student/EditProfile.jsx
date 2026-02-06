import { useEffect, useState } from "react";
import axios from "axios";
import ProfileSidebar from "../../components/ProfileSidebar";

export default function EditProfile() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    headline: "",
    biography: "",
    occupation: "",
    field_of_learning: "",
    skills: [],
    interests: [],
    resume_url: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const user = JSON.parse(localStorage.getItem("user"));

const token = user?.token || localStorage.getItem("accessToken");

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        headline: data.headline || "",
        biography: data.biography || "",
        occupation: data.occupation || "",
        field_of_learning: data.field_of_learning || "",
        skills: data.skills || [],
        interests: data.interests || [],
        resume_url: data.resume_url || "",
      });
    } catch (err) {
      console.error("Error fetching profile:", err.response?.data || err.message);
    }
  };

  fetchProfile();
}, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async () => {
  try {
    console.log("Sending form:", form);
    const res = await axios.put(`${API_URL}/users/me`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Response:", res.data);
    alert("Profile updated");
  } catch (err) {
    console.error("UPDATE ERROR:", err.response?.data || err.message);
    alert("Update failed — check console");
  }
};

const addSkill = (e) => {
  if (e.key === "Enter" && e.target.value.trim() !== "") {
    e.preventDefault();
    setForm({
      ...form,
      skills: [...form.skills, e.target.value.trim()]
    });
    e.target.value = "";
  }
};

const removeSkill = (index) => {
  setForm({
    ...form,
    skills: form.skills.filter((_, i) => i !== index)
  });
};

const addInterest = (e) => {
  if (e.key === "Enter" && e.target.value.trim() !== "") {
    e.preventDefault();
    setForm({
      ...form,
      interests: [...form.interests, e.target.value.trim()]
    });
    e.target.value = "";
  }
};

const removeInterest = (index) => {
  setForm({
    ...form,
    interests: form.interests.filter((_, i) => i !== index)
  });
};


return (
  <div className="max-w-7xl mx-auto flex">
    
    {/* LEFT SIDEBAR */}
    <ProfileSidebar />

    {/* RIGHT CONTENT */}
    <div className="flex-1 px-10 py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

   {/* BASICS */}
    <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
    <h2 className="text-lg font-semibold mb-4">Basics</h2>

    <div className="space-y-6">

        {/* First Name */}
        <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">First name</label>
        <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="Enter your first name"
            className="input"
        />
        </div>

        {/* Last Name */}
        <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Last name</label>
        <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Enter your last name"
            className="input"
        />
        </div>

        {/* Headline */}
        <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Headline</label>
        <input
            name="headline"
            value={form.headline}
            onChange={handleChange}
            placeholder="e.g. Web Developer, Data Analyst"
            className="input"
        />
        </div>

        {/* Occupation */}
        <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Occupation</label>
        <input
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            placeholder="Your current role"
            className="input"
        />
        </div>

        {/* Field of Learning */}
        <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Field of learning</label>
        <input
            name="field_of_learning"
            value={form.field_of_learning}
            onChange={handleChange}
            placeholder="e.g. Software Engineering, Design"
            className="input"
        />
        </div>

    </div>
    </div>



      {/* BIOGRAPHY */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-lg font-semibold mb-4">Biography</h2>
        <textarea
          name="biography"
          value={form.biography}
          onChange={handleChange}
          className="input h-40"
          placeholder="Tell learners about yourself"
        />
      </div>

      {/* LINKS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-lg font-semibold mb-4">Links</h2>
        <input name="resume_url" value={form.resume_url} onChange={handleChange} placeholder="Resume URL" className="input mb-4" />
      </div>

      {/* SKILLS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-lg font-semibold mb-4">Skills</h2>

        <div className="flex flex-wrap gap-2 mb-3">
          {form.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
              {skill}
              <button type="button" onClick={() => removeSkill(index)} className="text-red-500 font-bold">×</button>
            </span>
          ))}
        </div>

        <input
          type="text"
          placeholder="Type a skill and press Enter"
          onKeyDown={addSkill}
          className="input"
        />
      </div>

      {/* INTERESTS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-lg font-semibold mb-4">Interests</h2>

        <div className="flex flex-wrap gap-2 mb-3">
          {form.interests.map((interest, index) => (
            <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
              {interest}
              <button type="button" onClick={() => removeInterest(index)} className="text-red-500 font-bold">×</button>
            </span>
          ))}
        </div>

        <input
          type="text"
          placeholder="Type an interest and press Enter"
          onKeyDown={addInterest}
          className="input"
        />
      </div>

      <button onClick={handleSubmit} className="bg-primary text-white px-6 py-3 rounded-lg font-semibold">
        Save changes
      </button>
    </div>
  </div>
);
}

