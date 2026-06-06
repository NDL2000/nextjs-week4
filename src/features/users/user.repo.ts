import sql from "@/lib/db";
import { User, CreateUserInput } from "./user.types";

export const userRepo = {
  findAll: async (): Promise<User[]> => {
    const rows = await sql`
      SELECT * FROM users
      ORDER BY created_at DESC
    `;
    return rows as User[];
  },

  findById: async (id: string): Promise<User | null> => {
    const rows = await sql`
      SELECT * FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return (rows[0] as User) ?? null;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const rows = await sql`
      SELECT * FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
    return (rows[0] as User) ?? null;
  },

  create: async (data: CreateUserInput): Promise<User> => {
    const rows = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${data.name}, ${data.email}, ${data.password})
      RETURNING *
    `;
    return rows[0] as User;
  },
};
