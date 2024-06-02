export type PermissionType = "member" | "partner" | "admin";
export const permissions: PermissionType[] = ["member", "partner", "admin"];

export function decodePermission(
  decimal: number,
): Record<PermissionType, boolean> {
  const length = permissions.length;
  const maxDecimal = 2 ** length - 1;

  if (decimal < 0 || decimal > maxDecimal) {
    throw new Error(`Invalid permission: ${decimal}`);
  }

  const binaryString = decimal.toString(2);
  const booleanArray = Array.from(binaryString, (char) => char === "1");
  const paddingLength = length - booleanArray.length;
  const fullArray = new Array(paddingLength).fill(false).concat(booleanArray);

  return permissions.reduce(
    (acc, permission, index) => {
      acc[permission] = fullArray[index];
      return acc;
    },
    {} as Record<PermissionType, boolean>,
  );
}
