import type { Session } from "../auth/type";

export function sessionFromParse(data: Session): Session | undefined {
  if (!data.user) return undefined;
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      permission: data.user.permission,
      did: data.user.did,
    },
    expires: new Date(data.expires),
  };
}
