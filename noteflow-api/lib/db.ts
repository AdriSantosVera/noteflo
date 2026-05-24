import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;

export async function query<T = unknown>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!sql) {
    throw new Error("DATABASE_URL no está configurada");
  }

  const result = await sql.query(text, params);
  return result as T[];
}
