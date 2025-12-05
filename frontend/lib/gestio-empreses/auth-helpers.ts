import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDataAccessLevel, type UserRole } from "./permissions"

export async function getGestioSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const role = session.user.role as UserRole
  const dataAccess = getDataAccessLevel(role)

  return {
    userId: session.user.id,
    role,
    dataAccess,
    email: session.user.email
  }
}