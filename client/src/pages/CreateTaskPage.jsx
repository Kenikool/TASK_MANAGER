import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaTasks,
  FaRegCalendarAlt,
  FaFlag,
  FaImage,
  FaAlignLeft,
  FaUpload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const initialState = {
  title: "",
  description: "",
  status: "pending",
  dueDate: "",
  priority: "medium",
  image: "",
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const CreateTaskPage = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (form.image && form.image.trim() !== "") {
      // Validate URL or base64
      const isUrl = (() => {
        try {
          new URL(form.image);
          return true;
        } catch {
          return false;
        }
      })();
      const isBase64 = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(
        form.image
      );
      if (!isUrl && !isBase64)
        newErrors.image = "Image must be a valid URL or base64 string";
    }
    if (form.dueDate && isNaN(new Date(form.dueDate).getTime())) {
      newErrors.dueDate = "Due date is invalid";
    }
    return newErrors;
  };

  // Convert file to base64 and set as image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          image: reader.result, // base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (e) => {
    setForm((prev) => ({
      ...prev,
      image: e.target.value,
    }));
    setImageFile(null); // Clear file if user switches to URL
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to create task.");
      } else {
        toast.success("Task created successfully!");
        setForm(initialState);
        setImageFile(null);
        navigate("/tasks");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-lg p-8 bg-base-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-primary mb-6 flex items-center justify-center gap-2">
          <FaTasks className="inline-block" /> Create New Task
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div>
            <label className="label" htmlFor="title">
              <span className="label-text flex items-center gap-2">
                <FaTasks /> Title
              </span>
            </label>
            <input
              className={`input input-bordered w-full ${
                errors.title ? "input-error" : ""
              }`}
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.title && (
              <span className="text-error text-sm">{errors.title}</span>
            )}
          </div>
          {/* Description */}
          <div>
            <label className="label" htmlFor="description">
              <span className="label-text flex items-center gap-2">
                <FaAlignLeft /> Description
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          {/* Status */}
          <div>
            <label className="label" htmlFor="status">
              <span className="label-text flex items-center gap-2">
                <FaFlag /> Status
              </span>
            </label>
            <select
              className="select select-bordered w-full"
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {/* Due Date */}
          <div>
            <label className="label" htmlFor="dueDate">
              <span className="label-text flex items-center gap-2">
                <FaRegCalendarAlt /> Due Date
              </span>
            </label>
            <input
              className={`input input-bordered w-full ${
                errors.dueDate ? "input-error" : ""
              }`}
              type="date"
              id="dueDate"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
            {errors.dueDate && (
              <span className="text-error text-sm">{errors.dueDate}</span>
            )}
          </div>
          {/* Priority */}
          <div>
            <label className="label" htmlFor="priority">
              <span className="label-text flex items-center gap-2">
                <FaFlag /> Priority
              </span>
            </label>
            <select
              className="select select-bordered w-full"
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {/* Image */}
          <div>
            <label className="label" htmlFor="image">
              <span className="label-text flex items-center gap-2">
                <FaImage /> Image (URL or upload, optional)
              </span>
            </label>
            <input
              className={`input input-bordered w-full ${
                errors.image ? "input-error" : ""
              }`}
              type="text"
              id="image"
              name="image"
              value={imageFile ? "" : form.image}
              onChange={handleImageUrlChange}
              placeholder="Paste image URL"
            />
            <div className="my-2 text-center text-sm text-gray-500">or</div>
            <input
              className="file-input file-input-bordered w-full"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {errors.image && (
              <span className="text-error text-sm">{errors.image}</span>
            )}
            {/* Preview */}
            {(form.image && !imageFile) && (
              <img src={form.image} alt="Preview" className="mt-2 max-h-32 mx-auto rounded" />
            )}
            {imageFile && (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-2 max-h-32 mx-auto rounded" />
            )}
          </div>
          {/* Submit */}
          <button
            className={`btn btn-primary w-full flex items-center justify-center gap-2 ${loading ? "loading" : ""}`}
            type="submit"
            disabled={loading}
          >
            <FaUpload />
            {loading ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskPage;
