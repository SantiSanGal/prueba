import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requireAuth";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows: roleRows } = await pool.query(
    `SELECT r.name
       FROM user_role ur
       JOIN role r ON r.id = ur.role_id
       JOIN app_user u ON u.id = ur.user_id
      WHERE u.firebase_uid = $1`,
    [user.uid]
  );
  const roles = roleRows.map((r) => r.name as string);
  if (!roles.includes("super_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { rows } = await pool.query(
    `SELECT u.id, u.email, p.first_name, p.last_name
       FROM app_user u
       JOIN person p ON p.id = u.person_id
      WHERE EXISTS (
            SELECT 1
              FROM user_role ur
              JOIN role r ON r.id = ur.role_id
             WHERE ur.user_id = u.id AND r.name='supervisor'
      )
      ORDER BY p.last_name, p.first_name`
  );

  return NextResponse.json(rows);
}
