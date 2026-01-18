import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from '@/database/schemas/role.schema';
import { Permission, PermissionSchema } from '@/database/schemas/permission.schema';
import { RolePermission, RolePermissionSchema } from '@/database/schemas/role-permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
