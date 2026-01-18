import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user.schema';
import { Role } from '@/database/schemas/role.schema';
import { Permission } from '@/database/schemas/permission.schema';
import { RolePermission } from '@/database/schemas/role-permission.schema';
import { JwtPayload } from '@/common/interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(RolePermission.name) private rolePermissionModel: Model<RolePermission>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId } = payload;

    // Fetch user with populated campus
    const user = await this.userModel
      .findById(userId)
      .select('-faceData -fingerprintData')
      .populate('campusId', 'campusCode campusName')
      .populate('roleId', 'roleCode roleLevel')
      .exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Fetch user permissions
    const rolePermissions = await this.rolePermissionModel
      .find({ roleId: user.roleId })
      .populate('permissionId')
      .exec();

    const permissions = rolePermissions.map((rp: any) => rp.permissionId.permissionName);

    console.log('🔑 JWT Strategy validate:', {
      userId: user._id,
      email: user.email,
      roleCode: (user.roleId as any).roleCode,
      rolePermissionsCount: rolePermissions.length,
      permissionsExtracted: permissions.length,
      permissionsSample: permissions.slice(0, 3),
    });

    // Attach enhanced data to request.user
    return {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleCode: (user.roleId as any).roleCode,
      roleLevel: (user.roleId as any).roleLevel,
      campusId: user.campusId?._id || null,
      campusCode: (user.campusId as any)?.campusCode || null,
      permissions,
      isActive: user.isActive,
    };
  }
}
