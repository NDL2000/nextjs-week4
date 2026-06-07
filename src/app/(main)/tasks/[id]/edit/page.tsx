import { taskService } from "@/features/tasks/task.service";
import EditTaskForm from "./EditTaskForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await taskService.getById(id);

  return <EditTaskForm task={task} />;
}
