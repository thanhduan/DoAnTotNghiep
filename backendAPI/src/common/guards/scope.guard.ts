import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '@/common/decorators/scopes.decorator';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const roleScope = user.roleScope || user.scope;

    if (!roleScope) {
      throw new ForbiddenException('User scope is missing');
    }

    if (!requiredScopes.includes(roleScope)) {
      throw new ForbiddenException(
        `Scope ${roleScope} is not allowed. Required: ${requiredScopes.join(', ')}`,
      );
    }

    request.scopeContext = {
      scope: roleScope,
      userId: user._id?.toString?.() || user._id,
      campusId: user.campusId || null,
    };

    return true;
  }
}
