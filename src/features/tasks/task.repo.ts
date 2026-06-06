import sql from "@/lib/db";
import { Task, CreateTaskInput, UpdateTaskInput } from "./task.types";

const PAGE_SIZE = 5;

export const taskRepo = {
  findAll: async (
    userId: string,
    page: number = 1,
    status?: string,
    search?: string,
  ): Promise<{ data: Task[]; count: number }> => {
    const from = (page - 1) * PAGE_SIZE;
    const searchPattern = `%${search ?? ""}%`;
    const hasStatus = status && status !== "all";

    let rows;
    let countRows;

    if (hasStatus) {
      rows = await sql`
        SELECT * FROM tasks
        WHERE user_id = ${userId}
          AND status = ${status}
          AND title ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE} OFFSET ${from}
      `;
      countRows = await sql`
        SELECT COUNT(*) as count FROM tasks
        WHERE user_id = ${userId}
          AND status = ${status}
          AND title ILIKE ${searchPattern}
      `;
    } else {
      rows = await sql`
        SELECT * FROM tasks
        WHERE user_id = ${userId}
          AND title ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE} OFFSET ${from}
      `;
      countRows = await sql`
        SELECT COUNT(*) as count FROM tasks
        WHERE user_id = ${userId}
          AND title ILIKE ${searchPattern}
      `;
    }

    return {
      data: rows as Task[],
      count: Number(countRows[0].count),
    };
  },

  findAllForStats: async (userId: string): Promise<Task[]> => {
    const rows = await sql`
      SELECT * FROM tasks
      WHERE user_id = ${userId}
    `;
    return rows as Task[];
  },

  findById: async (id: string): Promise<Task | null> => {
    const rows = await sql`
      SELECT * FROM tasks
      WHERE id = ${id}
      LIMIT 1
    `;
    return (rows[0] as Task) ?? null;
  },

  create: async (data: CreateTaskInput): Promise<Task> => {
    const rows = await sql`
      INSERT INTO tasks (title, description, status, priority, due_date, user_id)
      VALUES (
        ${data.title},
        ${data.description ?? null},
        ${data.status},
        ${data.priority},
        ${data.due_date ?? null},
        ${data.user_id}
      )
      RETURNING *
    `;
    return rows[0] as Task;
  },

  update: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const rows = await sql`
      UPDATE tasks SET
        title = COALESCE(${data.title ?? null}, title),
        description = COALESCE(${data.description ?? null}, description),
        status = COALESCE(${data.status ?? null}, status),
        priority = COALESCE(${data.priority ?? null}, priority),
        due_date = COALESCE(${data.due_date ?? null}, due_date)
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] as Task;
  },

  delete: async (id: string): Promise<void> => {
    await sql`
      DELETE FROM tasks
      WHERE id = ${id}
    `;
  },
};
