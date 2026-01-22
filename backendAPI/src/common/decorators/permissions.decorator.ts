import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required permissions for a route
 * @param permissions - Array of permission strings (e.g., ['users.view', 'users.create'])
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
