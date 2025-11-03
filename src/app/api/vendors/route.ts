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
  const roles = roleRows.map(r => r.name as string);

  if (roles.includes("super_admin")) {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, p.first_name, p.last_name
         FROM app_user u
         JOIN person p ON p.id = u.person_id
        WHERE EXISTS (
              SELECT 1
                FROM user_role ur
                JOIN role r ON r.id = ur.role_id
               WHERE ur.user_id = u.id AND r.name='vendedor'
        )
        ORDER BY p.last_name, p.first_name`
    );
    return NextResponse.json(rows);
  }

  if (roles.includes("supervisor")) {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, p.first_name, p.last_name
         FROM supervisor_vendor sv
         JOIN app_user u ON u.id = sv.vendor_user_id
         JOIN person p ON p.id = u.person_id
        WHERE sv.supervisor_user_id = (SELECT id FROM app_user WHERE firebase_uid=$1)
        ORDER BY p.last_name, p.first_name`,
      [user.uid]
    );
    return NextResponse.json(rows);
  }

  if (roles.includes("vendedor")) {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, p.first_name, p.last_name
         FROM app_user u
         JOIN person p ON p.id = u.person_id
        WHERE u.firebase_uid = $1`,
      [user.uid]
    );
    return NextResponse.json(rows);
  }

  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
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
  const roles = roleRows.map(r => r.name as string);
  if (!roles.includes("super_admin") && !roles.includes("supervisor")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const person = await client.query(
      `INSERT INTO person (first_name,last_name) VALUES ($1,$2) RETURNING id`,
      [body.firstName, body.lastName]
    );
    const userRow = await client.query(
      `INSERT INTO app_user (person_id,firebase_uid,email) VALUES ($1,$2,$3) RETURNING id`,
      [person.rows[0].id, body.firebaseUid ?? `TEMP_${Date.now()}`, body.email ?? null]
    );
    await client.query(
      `INSERT INTO user_role (user_id, role_id)
       SELECT $1, id FROM role WHERE name='vendedor'`,
      [userRow.rows[0].id]
    );
    await client.query("COMMIT");
    return NextResponse.json({ id: userRow.rows[0].id }, { status: 201 });
  } catch (e) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  } finally {
    client.release();
  }
}