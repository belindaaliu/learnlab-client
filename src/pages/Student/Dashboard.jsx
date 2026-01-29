import React from "react";
import CourseCard from "../../components/CourseCard";

const MOCK_USER = {
  first_name: "Samira",
  occupation: "Full‑Stack Developer",
  interests: ["React", "UI/UX", "Cloud"],
  skills: ["JavaScript", "Node.js", "Prisma"]
};

const MOCK_RECOMMENDED = [
  {
    id: 1,
    title: "Advanced React Patterns",
    instructor: "John Doe",
    rating: 4.8,
    reviews: 120,
    price: 79.99,
    duration: "18h",
    lessons: 95,
    category: "Development",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Node.js API Mastery",
    instructor: "Sarah Lee",
    rating: 4.7,
    reviews: 90,
    price: 59.99,
    duration: "12h",
    lessons: 60,
    category: "Backend",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop"
  }
];

const StudentDashboard = () => {
  return (
    <div className="pb-20 max-w-7xl mx-auto px-4">

      {/* WELCOME */}
      <div className="mt-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {MOCK_USER.first_name}
        </h1>

        <p className="text-gray-600 mt-1 flex items-center gap-3">
          {MOCK_USER.occupation}
          <span className="text-primary font-semibold cursor-pointer hover:underline">
            Edit occupation & interests
          </span>
        </p>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900">
          What to learn next
        </h2>
        <p className="text-gray-500 mb-6">Recommended for you</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_RECOMMENDED.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
