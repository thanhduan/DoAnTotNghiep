export interface JwtPayload {
  sub: string; // userId
  email: string;
  roleCode: string; // SUPER_ADMIN, CAMPUS_ADMIN, etc.
  roleLevel: number; // Hierarchy level
  roleScope: string; // GLOBAL, CAMPUS, SELF
  campusId: string | null; // null for Super Admin in Phase 1
  permissions: string[]; // Array of permission strings
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}
