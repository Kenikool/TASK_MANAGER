import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../components/LoadingSpinner";

const initialState = {
  username: "",
  email: "",
  password: "",
};

const RegistrationPage = () => {
  const [formData, setformData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const {
    mutate: register,

    isPending,
  } = useMutation({
    mutationFn: async ({ email, username, password }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      return data;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed");
    },
  });
  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleChange = (e) => {
    setformData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }
    register(formData);
    console.log(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-8 space-y-4 bg-base-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-primary flex items-center justify-center gap-2">
          <FaUserPlus /> Register
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label" htmlFor="username">
              <span className="label-text flex items-center gap-2">
                <FaUser /> Username
              </span>
            </label>
            <div className="relative">
              <input
                className={`input input-bordered w-full pl-10 ${
                  errors.username ? "input-error" : ""
                }`}
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
              />
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.username && (
              <span className="text-error text-sm">{errors.username}</span>
            )}
          </div>
          <div>
            <label className="label" htmlFor="email">
              <span className="label-text flex items-center gap-2">
                <FaEnvelope /> Email
              </span>
            </label>
            <div className="relative">
              <input
                className={`input input-bordered w-full pl-10 ${
                  errors.email ? "input-error" : ""
                }`}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.email && (
              <span className="text-error text-sm">{errors.email}</span>
            )}
          </div>
          <div>
            <label className="label" htmlFor="password">
              <span className="label-text flex items-center gap-2">
                <FaLock /> Password
              </span>
            </label>
            <div className="relative">
              <input
                className={`input input-bordered w-full pl-10 ${
                  errors.password ? "input-error" : ""
                }`}
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.password && (
              <span className="text-error text-sm">{errors.password}</span>
            )}
          </div>
          <button
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            type="submit"
            disabled={isPending}
          >
            <FaUserPlus />
            {isPending ? <LoadingSpinner /> : "Register"}
          </button>
        </form>
        <div className="text-center">
          <span>Already have an account? </span>
          <Link to="/login" className="link link-primary">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
