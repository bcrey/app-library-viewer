import { NextRequest } from "next/server";

export function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && token === adminPassword;
}
