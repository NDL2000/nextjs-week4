"use client";

import { Task } from "@/features/tasks/task.types";
import { updateTaskStatusAction } from "@/actions/task.action";
import DeleteTaskButton from "./DeleteTaskButton";
import Link from "next/link";

type Props = {
  tasks: Task[];
};

const columns = [
  { id: "todo", label: "To Do", color: "bg-gray-100 text-gray-600" },
  {
    id: "in_progress",
    label: "In Progress",
    color: "bg-blue-50 text-blue-600",
  },
  { id: "done", label: "Done", color: "bg-green-50 text-green-600" },
];

const priorityConfig = {
  critical: { label: "🔴 Critical" },
  high: { label: "🟠 High" },
  medium: { label: "🟡 Medium" },
  low: { label: "🔵 Low" },
  lowest: { label: "⚪ Lowest" },
};

export default function KanbanBoard({ tasks }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Column Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${col.color}`}
                >
                  {col.label}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {colTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="p-3 flex flex-col gap-2 min-h-32">
              {colTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-300 text-sm">
                  No tasks
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <p className="font-medium text-gray-800 text-sm mb-2">
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {priorityConfig[task.priority].label}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-gray-400">
                          {new Date(task.due_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                      {/* Move status buttons */}
                      {col.id !== "todo" && (
                        <button
                          onClick={() =>
                            updateTaskStatusAction(
                              task.id,
                              col.id === "in_progress" ? "todo" : "in_progress",
                            )
                          }
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          ← Back
                        </button>
                      )}
                      {col.id !== "done" && (
                        <button
                          onClick={() =>
                            updateTaskStatusAction(
                              task.id,
                              col.id === "todo" ? "in_progress" : "done",
                            )
                          }
                          className="text-xs text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          Next →
                        </button>
                      )}
                      <div className="ml-auto flex gap-2">
                        <Link href={`/tasks/${task.id}/edit`}>
                          <span className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                            Edit
                          </span>
                        </Link>
                        <DeleteTaskButton id={task.id} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
