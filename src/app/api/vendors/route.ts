import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requireAuth";
import { adminAuth } from "@/lib/firebaseAdmin";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

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
  const DEFAULT_PWD = "123456";

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
  if (!roles.includes("super_admin") && !roles.includes("supervisor")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { firstName, lastName, email, supervisorUserId } = body || {};
  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: "firstName, lastName y email son requeridos" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const reqUserRes = await client.query(
      `SELECT id FROM app_user WHERE firebase_uid=$1`,
      [user.uid]
    );
    const requesterUserId = reqUserRes.rows[0]?.id;
    if (!requesterUserId) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Requester not found" }, { status: 400 });
    }

    let chosenSupervisorId: string | null = null;
    if (roles.includes("super_admin")) {
      if (!supervisorUserId) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "supervisorUserId es requerido para super_admin" }, { status: 400 });
      }
      const supCheck = await client.query(
        `SELECT 1
           FROM app_user u
          WHERE u.id=$1
            AND EXISTS (
              SELECT 1 FROM user_role ur
              JOIN role r ON r.id = ur.role_id
              WHERE ur.user_id = u.id AND r.name='supervisor'
            )`,
        [supervisorUserId]
      );
      if (supCheck.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "supervisorUserId inválido" }, { status: 400 });
      }
      chosenSupervisorId = supervisorUserId;
    } else {
      chosenSupervisorId = requesterUserId;
    }

    const person = await client.query(
      `INSERT INTO person (first_name,last_name) VALUES ($1,$2) RETURNING id`,
      [firstName, lastName]
    );
    const userRow = await client.query(
      `INSERT INTO app_user (person_id,firebase_uid,email) VALUES ($1,$2,$3) RETURNING id`,
      [person.rows[0].id, `TEMP_${Date.now()}`, email]
    );
    const newVendorUserId = userRow.rows[0].id;

    await client.query(
      `INSERT INTO user_role (user_id, role_id)
       SELECT $1, id FROM role WHERE name='vendedor'`,
      [newVendorUserId]
    );

    if (chosenSupervisorId) {
      await client.query(
        `INSERT INTO supervisor_vendor (supervisor_user_id, vendor_user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [chosenSupervisorId, newVendorUserId]
      );
    }

    let firebaseUid: string;
    try {
      const existing = await adminAuth.getUserByEmail(email);
      firebaseUid = existing.uid;
      await adminAuth.updateUser(firebaseUid, { password: DEFAULT_PWD });
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        const created = await adminAuth.createUser({
          email,
          password: DEFAULT_PWD,
          displayName: `${firstName} ${lastName}`,
          emailVerified: false,
        });
        firebaseUid = created.uid;
      } else {
        throw e;
      }
    }

    await client.query(
      `UPDATE app_user SET firebase_uid=$1 WHERE id=$2`,
      [firebaseUid, newVendorUserId]
    );

    await client.query("COMMIT");
    return NextResponse.json({ id: newVendorUserId, firebaseUid }, { status: 201 });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  } finally {
    client.release();
  }
}
