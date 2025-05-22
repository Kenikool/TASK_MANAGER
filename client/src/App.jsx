import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateTaskPage from "./pages/CreateTaskPage";
import RegistrationPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import TaskPage from "./pages/TaskPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "./components/LoadingSpinner";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  const queryClient = useQueryClient();
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );

  // Helper to check if user is an admin
  const isAdmin = authUser && authUser.role === "admin";
  return (
    <div className="">
      <Navbar authUser={authUser} />
      <Routes>
        <Route path="/" element={authUser ? <TaskPage /> : <HomePage />} />
        <Route
          path="/create-task"
          element={authUser ? <CreateTaskPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/register"
          element={!authUser ? <RegistrationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/task"
          element={authUser ? <TaskPage /> : <Navigate to="/login" />}
        />
        {/* Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminDashboardPage />
            ) : authUser ? (
              <Navigate to="/" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
