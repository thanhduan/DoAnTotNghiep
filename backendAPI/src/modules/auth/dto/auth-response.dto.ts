export class AuthResponseDto {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatar: string;
    roleId?: string;
    campusId: any; // Can be string (ID) or Campus object (populated)
  };
  roleDetails?: {
    id: string;
    roleCode: string;
    roleName: string;
    roleLevel: number;
    description: string;
  };
  permissions?: Array<{
    id: string;
    permissionName: string;
    resource: string;
    action: string;
    description: string;
  }>;
}
