import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requireAuth";
import { pool } from "@/lib/db";

async function getRolesByUid(uid: string): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT r.name
       FROM user_role ur
       JOIN role r ON r.id = ur.role_id
       JOIN app_user u ON u.id = ur.user_id
      WHERE u.firebase_uid = $1`,
    [uid]
  );
  return rows.map(r => r.name as string);
}

async function canManageVendor(uid: string, vendorId: string, roles: string[]) {
  if (roles.includes("super_admin")) return true;

  if (roles.includes("supervisor")) {
    const { rows } = await pool.query(
      `SELECT 1
         FROM supervisor_vendor sv
        WHERE sv.supervisor_user_id = (SELECT id FROM app_user WHERE firebase_uid=$1)
          AND sv.vendor_user_id = $2
        LIMIT 1`,
      [uid, vendorId]
    );
    return rows.length > 0;
  }

  return false;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = await getRolesByUid(user.uid);
  if (!roles.includes("super_admin") && !roles.includes("supervisor")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: vendorId } = params;
  if (!(await canManageVendor(user.uid, vendorId, roles))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const vend = await client.query(
      `SELECT u.id, u.person_id
         FROM app_user u
        WHERE u.id = $1
          AND EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON r.id = ur.role_id
            WHERE ur.user_id = u.id AND r.name = 'vendedor'
          )`,
      [vendorId]
    );
    if (vend.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    await client.query(
      `UPDATE person SET first_name=$1, last_name=$2 WHERE id=$3`,
      [body.firstName, body.lastName, vend.rows[0].person_id]
    );
    await client.query(
      `UPDATE app_user SET email=$1 WHERE id=$2`,
      [body.email ?? null, vendorId]
    );

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = await getRolesByUid(user.uid);
  if (!roles.includes("super_admin") && !roles.includes("supervisor")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: vendorId } = params;
  if (!(await canManageVendor(user.uid, vendorId, roles))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const vend = await client.query(
      `SELECT u.id, u.person_id
         FROM app_user u
        WHERE u.id = $1
          AND EXISTS (
            SELECT 1 FROM user_role ur
            JOIN role r ON r.id = ur.role_id
            WHERE ur.user_id = u.id AND r.name = 'vendedor'
          )`,
      [vendorId]
    );
    if (vend.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    await client.query(`DELETE FROM app_user WHERE id=$1`, [vendorId]);
    await client.query(`DELETE FROM person WHERE id=$1`, [vend.rows[0].person_id]);

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  } finally {
    client.release();
  }
}
