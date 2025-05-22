import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaUserShield,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const baseNavLinks = [
  { name: "Home", href: "/" },
  { name: "Create Task", href: "/create-task" },
  { name: "Task", href: "/task" },
];

const authLinks = [
  { name: "Register", href: "/register" },
  { name: "Login", href: "/login" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const queryClient = useQueryClient();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // Helper: check if user is admin
  const isAdmin = authUser && authUser.role === "admin";

  // Compose nav links based on login status and admin status
  let navLinks = authUser ? baseNavLinks : [...baseNavLinks, ...authLinks];
  if (authUser) {
    navLinks = [
      ...navLinks,
      {
        name: "Profile",
        href: "/profile",
        icon: <FaUserCircle className="inline mr-1" />,
      },
    ];
  }
  if (authUser && isAdmin) {
    navLinks = [
      ...navLinks,
      {
        name: "Admin Dashboard",
        href: "/admin",
        icon: <FaUserShield className="inline mr-1" />,
      },
    ];
  }

  return (
    <nav className="navbar bg-base-100 shadow-md px-4 sticky w-full top-0 z-50">
      <div className="navbar-start">
        <Link to="/" className="text-xl font-bold text-primary">
          TaskManager
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.href} className="font-medium flex items-center">
                {link.icon && link.icon}
                {link.name}
              </Link>
            </li>
          ))}
          {authUser && (
            <li>
              <button
                className="btn btn-ghost font-medium flex items-center gap-2"
                onClick={logout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-end flex items-center gap-2">
        <button
          className="btn btn-ghost btn-circle"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <FaMoon className="text-xl" />
          ) : (
            <FaSun className="text-xl" />
          )}
        </button>
        <button
          className="btn btn-ghost btn-circle lg:hidden"
          onClick={toggleMenu}
          aria-label="Open Menu"
        >
          {menuOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <FaBars className="text-xl" />
          )}
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-base-100 shadow-lg lg:hidden animate-fade-in">
          <ul className="menu menu-vertical px-4 py-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className="font-medium flex items-center"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon && link.icon}
                  {link.name}
                </Link>
              </li>
            ))}
            {authUser && (
              <li>
                <button
                  className="btn btn-ghost font-medium flex items-center gap-2"
                  onClick={logout}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
