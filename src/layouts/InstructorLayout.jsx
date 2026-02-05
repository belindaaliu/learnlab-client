import { Outlet } from "react-router-dom";
import InstructorNavbar from "../components/Navbars/InstructorNavbar";

export default function InstructorLayout() {
  return (
    <>
      {/* Master Panel Header */}
      <InstructorNavbar />

      {/* The content of the dashboard's internal pages */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </>
  );
}
