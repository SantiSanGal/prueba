import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requireAuth";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rolesRes = await pool.query(
    `SELECT r.name
       FROM user_role ur
       JOIN role r ON r.id = ur.role_id
       JOIN app_user u ON u.id = ur.user_id
      WHERE u.firebase_uid = $1`,
    [user.uid]
  );

  const appUserRes = await pool.query(
    `SELECT id FROM app_user WHERE firebase_uid=$1`,
    [user.uid]
  );

  return NextResponse.json({
    uid: user.uid,
    appUserId: appUserRes.rows[0]?.id ?? null,
    roles: rolesRes.rows.map((r) => r.name),
  });
}
