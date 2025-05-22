import React, { useState } from "react";
import TaskCard from "../components/TaskCard";
import { FaTasks, FaPlus, FaEdit, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Fetch all tasks
const fetchTasks = async () => {
  const res = await fetch("/api/tasks");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch tasks");
  return Array.isArray(data) ? data : data.tasks || [];
};

// Update a task (edit or complete)
const updateTask = async ({ id, updates }) => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update task");
  return data;
};

// Delete a task
const deleteTask = async (id) => {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete task");
  return data;
};

const TaskPage = () => {
  const queryClient = useQueryClient();

  // Fetch tasks
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    isRefetching,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  // Mutations
  const editMutation = useMutation({
    mutationFn: ({ id, updates }) => updateTask({ id, updates }),
    onSuccess: () => {
      toast.success("Task updated!");
      closeEditModal();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id }) => updateTask({ id, updates: { status: "completed" } }),
    onSuccess: () => {
      toast.success("Task marked as completed!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => {
      toast.success("Task deleted!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => toast.error(err.message),
  });

  // Editing modal state
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Open edit modal
  const handleEdit = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      priority: task.priority,
      image: task.image || "",
    });
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingTask(null);
    setEditForm({});
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Submit edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingTask) return;
    editMutation.mutate({ id: editingTask._id, updates: editForm });
  };

  // Delete task
  const handleDelete = (task) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    deleteMutation.mutate(task._id);
  };

  // Complete task
  const handleComplete = (task) => {
    completeMutation.mutate({ id: task._id });
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-primary">
            <FaTasks /> My Tasks
          </h1>
          <Link
            to="/create-task"
            className="btn btn-primary flex items-center gap-2"
          >
            <FaPlus /> New Task
          </Link>
        </div>
        {(isLoading || isRefetching) && <LoadingSpinner />}
        {isError && <div className="alert alert-error mb-4">{error.message}</div>}
        {!isLoading && !isRefetching && !isError && tasks.length === 0 && (
          <div className="text-center text-base-content py-8">
            No tasks found.{" "}
            <Link to="/create-task" className="link link-primary">
              Create your first task!
            </Link>
          </div>
        )}
        {!isLoading &&
          !isRefetching &&
          !isError &&
          tasks.length > 0 &&
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onComplete={handleComplete}
              disableActions={
                editMutation.isPending ||
                completeMutation.isPending ||
                deleteMutation.isPending
              }
            />
          ))}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
              onClick={closeEditModal}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaEdit /> Edit Task
            </h2>
            <form className="space-y-3" onSubmit={handleEditSubmit}>
              <div>
                <label className="label" htmlFor="title">
                  <span className="label-text">Title</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  id="title"
                  name="title"
                  value={editForm.title || ""}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="description">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  id="description"
                  name="description"
                  value={editForm.description || ""}
                  onChange={handleEditChange}
                  rows={3}
                />
              </div>
              <div>
                <label className="label" htmlFor="status">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  id="status"
                  name="status"
                  value={editForm.status || "pending"}
                  onChange={handleEditChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="dueDate">
                  <span className="label-text">Due Date</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={editForm.dueDate || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="priority">
                  <span className="label-text">Priority</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  id="priority"
                  name="priority"
                  value={editForm.priority || "medium"}
                  onChange={handleEditChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="image">
                  <span className="label-text">Image (URL or base64)</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  id="image"
                  name="image"
                  value={editForm.image || ""}
                  onChange={handleEditChange}
                  placeholder="https://example.com/image.jpg or data:image/png;base64,..."
                />
              </div>
              <button
                className="btn btn-primary w-full mt-2"
                type="submit"
                disabled={editMutation.isPending}
              >
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;
