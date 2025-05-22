import React from "react";
import {
  FaRegCalendarAlt,
  FaFlag,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaImage,
} from "react-icons/fa";

const statusColors = {
  pending: "badge-warning",
  "in-progress": "badge-info",
  completed: "badge-success",
};

const priorityColors = {
  low: "badge-outline",
  medium: "badge-primary",
  high: "badge-error",
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onComplete,
  disableActions = false,
}) => {
  return (
    <div className="card bg-base-100 shadow-md mb-4">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-xl font-bold break-words">
            {task.title}
          </h2>
          <div
            className={`badge ${
              statusColors[task.status] || "badge-ghost"
            } capitalize`}
            aria-label={`Status: ${task.status}`}
          >
            {task.status}
          </div>
        </div>
        {task.image && (
          <div className="flex justify-center my-2">
            <img
              src={task.image}
              alt={task.title ? `Image for ${task.title}` : "Task image"}
              className="rounded-lg max-h-40 object-contain border"
              style={{ maxWidth: "100%" }}
              loading="lazy"
            />
          </div>
        )}
        <p className="text-base-content mb-2 min-h-[1.5em]">
          {task.description?.trim() ? (
            task.description
          ) : (
            <span className="italic text-gray-400">No description</span>
          )}
        </p>
        <div className="flex flex-wrap gap-3 items-center text-sm mb-2">
          <span
            className={`badge ${
              priorityColors[task.priority] || "badge-outline"
            } capitalize`}
            aria-label={`Priority: ${task.priority}`}
          >
            <FaFlag className="mr-1" /> {task.priority}
          </span>
          {task.dueDate && (
            <span
              className="badge badge-outline flex items-center gap-1"
              aria-label={`Due date: ${new Date(
                task.dueDate
              ).toLocaleDateString()}`}
            >
              <FaRegCalendarAlt /> {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          {task.status !== "completed" && (
            <button
              className="btn btn-success btn-sm flex items-center gap-1"
              onClick={() => onComplete && onComplete(task)}
              title="Mark as Completed"
              aria-label="Mark as Completed"
              disabled={disableActions}
              type="button"
            >
              <FaCheckCircle /> Complete
            </button>
          )}
          <button
            className="btn btn-info btn-sm flex items-center gap-1"
            onClick={() => onEdit && onEdit(task)}
            title="Edit Task"
            aria-label="Edit Task"
            disabled={disableActions}
            type="button"
          >
            <FaEdit /> Edit
          </button>
          <button
            className="btn btn-error btn-sm flex items-center gap-1"
            onClick={() => onDelete && onDelete(task)}
            title="Delete Task"
            aria-label="Delete Task"
            disabled={disableActions}
            type="button"
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
