import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { taskService } from "@/features/tasks/task.service";
import { logoutAction } from "@/actions/auth.action";
import DeleteTaskButton from "@/components/DeleteTaskButton";
import LogoutButton from "@/components/LogoutButton";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import Link from "next/link";

const PAGE_SIZE = 5;

const statusConfig = {
  todo: { label: "To Do", className: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-600" },
  done: { label: "Done", className: "bg-green-50 text-green-600" },
};

const priorityConfig = {
  critical: { label: "🔴 Critical", className: "bg-red-50 text-red-600" },
  high: { label: "🟠 High", className: "bg-orange-50 text-orange-600" },
  medium: { label: "🟡 Medium", className: "bg-yellow-50 text-yellow-600" },
  low: { label: "🔵 Low", className: "bg-blue-50 text-blue-600" },
  lowest: { label: "⚪ Lowest", className: "bg-gray-50 text-gray-500" },
};

const filterTabs = [
  { label: "All", value: "all" },
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { page: pageParam, status = "all", search } = await searchParams;
  const page = Number(pageParam ?? 1);

  const { data: tasks, count } = await taskService.getAll(
    session.id,
    page,
    status,
    search,
  );
  const allTasks = await taskService.getAllForStats(session.id);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const todo = allTasks.filter((t) => t.status === "todo").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const done = allTasks.filter((t) => t.status === "done").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <span className="font-semibold text-gray-800">TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Hi, {session.name}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">{count} total tasks</p>
          </div>
          <Link
            href="/tasks/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            + New Task
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "To Do", count: todo, color: "bg-gray-100" },
            { label: "In Progress", count: inProgress, color: "bg-blue-50" },
            { label: "Done", count: done, color: "bg-green-50" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stat.count}
              </p>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {filterTabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/dashboard?status=${tab.value}&page=1${search ? `&search=${search}` : ""}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  status === tab.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <SearchInput />
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {tasks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No tasks found</p>
              <p className="text-sm mt-1">
                {search
                  ? `No results for "${search}"`
                  : "Create your first task to get started"}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {task.title}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[task.status].className}`}
                      >
                        {statusConfig[task.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[task.priority].className}`}
                      >
                        {priorityConfig[task.priority].label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(task.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link href={`/tasks/${task.id}/edit`}>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            Edit
                          </span>
                        </Link>
                        <DeleteTaskButton id={task.id} />
                      </div>
                    </td>
                  </tr>
                ))}
                {Array.from({ length: PAGE_SIZE - tasks.length }).map(
                  (_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="px-5 py-4" colSpan={6}>
                        &nbsp;
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
