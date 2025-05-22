import React from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  FaUsers,
  FaUserShield,
  FaTasks,
  FaExclamationTriangle,
  FaUserClock,
  FaListOl,
  FaHistory,
} from "react-icons/fa";

const SectionHeader = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-primary">
    {icon}
    <span>{children}</span>
  </div>
);

const StatCard = ({ icon, label, value, color }) => (
  <div className={`card bg-base-200 shadow-md`}>
    <div className="card-body items-center text-center p-4">
      <div className={`text-4xl mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-base-content">{label}</div>
    </div>
  </div>
);

const Table = ({ columns, data, emptyMessage }) => (
  <div className="overflow-x-auto">
    <table className="table table-zebra bg-base-100 rounded-box shadow">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header} className="text-base-content">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="text-center py-6 text-base-content/50"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={row._id || idx}>
              {columns.map((col) => (
                <td key={col.header} className="text-base-content">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const AdminDashboardPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch dashboard");
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center bg-base-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-error bg-base-100 min-h-screen">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8 px-2">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center text-primary drop-shadow">
          Admin Dashboard
        </h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<FaUsers />}
            label="Total Users"
            value={data.userCount}
            color="text-primary"
          />
          <StatCard
            icon={<FaUserShield />}
            label="Admins"
            value={data.adminCount}
            color="text-success"
          />
          <StatCard
            icon={<FaTasks />}
            label="Total Tasks"
            value={data.taskCount}
            color="text-warning"
          />
          <StatCard
            icon={<FaExclamationTriangle />}
            label="Overdue Tasks"
            value={data.overdueTasks ? data.overdueTasks.length : 0}
            color="text-error"
          />
        </div>

        {/* User Role Breakdown */}
        <div className="mb-12 card bg-base-200 shadow-md p-4">
          <SectionHeader icon={<FaUsers />}>User Role Breakdown</SectionHeader>
          <ul className="flex flex-wrap gap-6 px-2">
            {data.userRoleBreakdown && data.userRoleBreakdown.length > 0 ? (
              data.userRoleBreakdown.map((role) => (
                <li
                  key={role._id}
                  className="badge badge-primary badge-outline px-4 py-2 text-base"
                >
                  <span className="font-semibold">{role._id}:</span>{" "}
                  {role.count}
                </li>
              ))
            ) : (
              <li className="text-base-content/50">No data</li>
            )}
          </ul>
        </div>

        {/* Task Status Breakdown */}
        <div className="mb-12 card bg-base-200 shadow-md p-4">
          <SectionHeader icon={<FaTasks />}>
            Task Status Breakdown
          </SectionHeader>
          <ul className="flex flex-wrap gap-6 px-2">
            {data.taskStatusBreakdown && data.taskStatusBreakdown.length > 0 ? (
              data.taskStatusBreakdown.map((status) => (
                <li
                  key={status._id}
                  className="badge badge-warning badge-outline px-4 py-2 text-base"
                >
                  <span className="font-semibold">{status._id}:</span>{" "}
                  {status.count}
                </li>
              ))
            ) : (
              <li className="text-base-content/50">No data</li>
            )}
          </ul>
        </div>

        {/* Recent Users */}
        <div className="mb-12 card bg-base-200 shadow-md p-4">
          <SectionHeader icon={<FaUserClock />}>Recent Users</SectionHeader>
          <Table
            columns={[
              { header: "Username", accessor: "username" },
              { header: "Email", accessor: "email" },
              { header: "Role", accessor: "role" },
              {
                header: "Joined",
                render: (user) => new Date(user.createdAt).toLocaleString(),
              },
            ]}
            data={data.recentUsers || []}
            emptyMessage="No recent users."
          />
        </div>

        {/* Recent Tasks */}
        <div className="mb-12 card bg-base-200 shadow-md p-4">
          <SectionHeader icon={<FaTasks />}>Recent Tasks</SectionHeader>
          <Table
            columns={[
              { header: "Title", accessor: "title" },
              { header: "Status", accessor: "status" },
              {
                header: "User",
                render: (task) => (task.user ? task.user.username : "N/A"),
              },
              {
                header: "Created",
                render: (task) => new Date(task.createdAt).toLocaleString(),
              },
              {
                header: "Due",
                render: (task) =>
                  task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A",
              },
            ]}
            data={data.recentTasks || []}
            emptyMessage="No recent tasks."
          />
        </div>

        {/* Most Active Users */}
        <div className="mb-12 card bg-base-200 shadow-md p-4">
          <SectionHeader icon={<FaListOl />}>Most Active Users</SectionHeader>
          <Table
            columns={[
              { header: "Username", accessor: "username" },
              { header: "Email", accessor: "email" },
              { header: "Task Count", accessor: "taskCount" },
            ]}
            data={data.mostActiveUsers || []}
            emptyMessage="No active users."
          />
        </div>

        {/* Overdue Tasks */}
        <div className="mb-12 card bg-base-200 shadow-md p-4">
          <SectionHeader icon={<FaExclamationTriangle />}>
            Overdue Tasks
          </SectionHeader>
          <Table
            columns={[
              { header: "Title", accessor: "title" },
              { header: "Status", accessor: "status" },
              {
                header: "User",
                render: (task) => (task.user ? task.user.username : "N/A"),
              },
              {
                header: "Due Date",
                render: (task) =>
                  task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A",
              },
            ]}
            data={data.overdueTasks || []}
            emptyMessage="No overdue tasks."
          />
        </div>

        {/* Recent Admin Actions */}
        <div className="mb-12 card bg-base-200 shadow-md p-4">
          <SectionHeader icon={<FaHistory />}>
            Recent Admin Actions
          </SectionHeader>
          <Table
            columns={[
              {
                header: "Admin",
                render: (action) =>
                  action.admin ? action.admin.username : "N/A",
              },
              { header: "Action", accessor: "action" },
              {
                header: "Target",
                render: (action) =>
                  action.target +
                  (action.targetId ? ` (${action.targetId})` : ""),
              },
              {
                header: "Details",
                render: (action) =>
                  action.details ? (
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(action.details, null, 2)}
                    </pre>
                  ) : (
                    ""
                  ),
              },
              {
                header: "Time",
                render: (action) => new Date(action.createdAt).toLocaleString(),
              },
            ]}
            data={data.recentAdminActions || []}
            emptyMessage="No recent admin actions."
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
