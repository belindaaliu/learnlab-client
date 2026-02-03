import { Outlet } from "react-router-dom";
import InstructorNavbar from "../components/Navbars/InstructorNavbar";

export default function InstructorLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Master Panel Header*/}
      <InstructorNavbar />

      {/* The content of the dashboard's internal pages is loaded here. */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      
    </div>
  );
}