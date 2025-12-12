export class AuthResponseDto {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatar: string;
    role: string;
    campusId: any; // Can be string (ID) or Campus object (populated)
  };
}
