import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";

const HomeLayout = () => {
  const location = useLocation();
  const isTeacherDashboard = location.pathname === '/teacher-dashboard';
  const isStudentDashboard = location.pathname === '/student-dashboard';
  
  return (
    <div>
      {!isTeacherDashboard && !isStudentDashboard && <Nav />}
      <Outlet />
    </div>
  );
};

export default HomeLayout;
