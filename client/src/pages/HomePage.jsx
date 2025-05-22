import React from "react";
import { FaTasks, FaUserCheck, FaRegCalendarAlt, FaRocket } from "react-icons/fa";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <FaTasks className="text-primary text-3xl" />,
    title: "Organize Tasks",
    desc: "Easily create, update, and manage your daily tasks.",
  },
  {
    icon: <FaUserCheck className="text-primary text-3xl" />,
    title: "Track Progress",
    desc: "Monitor your progress and stay productive.",
  },
  {
    icon: <FaRegCalendarAlt className="text-primary text-3xl" />,
    title: "Set Deadlines",
    desc: "Never miss a deadline with reminders and due dates.",
  },
  {
    icon: <FaRocket className="text-primary text-3xl" />,
    title: "Boost Productivity",
    desc: "Achieve more with a clean and intuitive interface.",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
          Welcome to TaskManager
        </h1>
        <p className="text-base-content text-lg mb-4">
          Your all-in-one solution to organize, track, and accomplish your tasks efficiently.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg mt-2">
          Get Started
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-3xl w-full">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="card bg-base-100 shadow-md p-6 flex flex-col items-center text-center"
          >
            <div className="mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
            <p className="text-base-content">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
