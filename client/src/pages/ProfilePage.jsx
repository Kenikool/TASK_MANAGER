import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { FaEdit, FaSave, FaCamera, FaEyeSlash, FaEye } from "react-icons/fa";

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // State for edit mode and form fields
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    profileImg: "",
  });
  const [imgPreview, setImgPreview] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    showCurrent: false,
    showNew: false,
  });

  // Fetch profile
  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
      return data;
    },
    onSuccess: (data) => {
      setForm({
        username: data.username,
        email: data.email,
        profileImg: data.profileImg || "",
      });
      setImgPreview(data.profileImg || "");
    },
    staleTime: 5 * 60 * 1000,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Profile updated!");
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => toast.error(err.message),
  });

  // Change password mutation
  const changePassword = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      return data;
    },
    onSuccess: () => {
      toast.success("Password changed!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        showCurrent: false,
        showNew: false,
      });
    },
    onError: (err) => toast.error(err.message),
  });

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, profileImg: reader.result }));
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle input changes
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Submit profile update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  // Submit password change
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    changePassword.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center bg-base-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8 px-2">
      <div className="max-w-xl mx-auto card bg-base-200 shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-primary text-center">
          My Profile
        </h1>
        <div className="flex flex-col items-center mb-6">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 relative">
              <img
                src={imgPreview || "/avatar-placeholder.png"}
                alt="Profile"
                className="object-cover"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow hover:bg-primary-focus"
                onClick={() => {
                  if (!editMode) setEditMode(true);
                  fileInputRef.current.click();
                }}
                title="Change profile picture"
              >
                <FaCamera />
              </button>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Profile Info */}
        <form onSubmit={handleProfileSubmit}>
          <div className="form-control mb-4">
            <label className="label font-semibold">Username</label>
            <input
              type="text"
              name="username"
              className="input input-bordered"
              value={form.username}
              onChange={handleChange}
              disabled={!editMode}
              required
            />
          </div>
          <div className="form-control mb-4">
            <label className="label font-semibold">Email</label>
            <input
              type="email"
              name="email"
              className="input input-bordered"
              value={form.email}
              onChange={handleChange}
              disabled={!editMode}
              required
            />
          </div>
          <div className="form-control mb-4">
            <label className="label font-semibold">Role</label>
            <input
              type="text"
              className="input input-bordered"
              value={user.role}
              disabled
              readOnly
            />
          </div>
          <div className="form-control mb-4">
            <label className="label font-semibold">Joined</label>
            <input
              type="text"
              className="input input-bordered"
              value={new Date(user.createdAt).toLocaleString()}
              disabled
              readOnly
            />
          </div>
          <div className="flex gap-2 justify-end">
            {!editMode ? (
              <button
                type="button"
                className="btn btn-primary btn-outline"
                onClick={() => setEditMode(true)}
              >
                <FaEdit className="mr-1" /> Edit
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={updateProfile.isLoading}
                >
                  <FaSave className="mr-1" />
                  {updateProfile.isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      username: user.username,
                      email: user.email,
                      profileImg: user.profileImg || "",
                    });
                    setImgPreview(user.profileImg || "");
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>

        {/* Divider */}
        <div className="divider my-8">Change Password</div>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-control mb-4">
            <label className="label font-semibold">Current Password</label>
            <div className="relative">
              <input
                type={passwords.showCurrent ? "text" : "password"}
                name="currentPassword"
                className="input input-bordered pr-10"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-lg text-base-content/70"
                tabIndex={-1}
                onClick={() =>
                  setPasswords((p) => ({
                    ...p,
                    showCurrent: !p.showCurrent,
                  }))
                }
              >
                {passwords.showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="form-control mb-4">
            <label className="label font-semibold">New Password</label>
            <div className="relative">
              <input
                type={passwords.showNew ? "text" : "password"}
                name="newPassword"
                className="input input-bordered pr-10"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-lg text-base-content/70"
                tabIndex={-1}
                onClick={() =>
                  setPasswords((p) => ({
                    ...p,
                    showNew: !p.showNew,
                  }))
                }
              >
                {passwords.showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={changePassword.isLoading}
          >
            {changePassword.isLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
