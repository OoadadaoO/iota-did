import type { Session } from "../auth/type";

export function sessionFromParse(data: Session): Session | undefined {
  if (!data.user) return undefined;
  return {
    user: {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      permission: data.user.permission,
    },
    expires: new Date(data.expires),
  };
}
