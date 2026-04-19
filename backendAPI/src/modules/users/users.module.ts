import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '@/database/schemas/user.schema';
import { Role, RoleSchema } from '@/database/schemas/role.schema';
import { Campus, CampusSchema } from '@/database/schemas/campus.schema';
import { FaceTemplate, FaceTemplateSchema } from '@/database/schemas/face-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Campus.name, schema: CampusSchema },
      { name: FaceTemplate.name, schema: FaceTemplateSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
