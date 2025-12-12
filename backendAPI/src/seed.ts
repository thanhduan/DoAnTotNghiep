import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campus } from './database/schemas/campus.schema';
import { User } from './database/schemas/user.schema';
import { UserRole } from './common/enums';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const campusModel = app.get<Model<Campus>>('CampusModel');
  const userModel = app.get<Model<User>>('UserModel');

  try {
    // Check if campuses already exist
    const existingCampuses = await campusModel.find();
    if (existingCampuses.length > 0) {
      console.log('✅ Campuses already exist:', existingCampuses.length);
    } else {
      // Insert sample campuses
      const campuses = [
        {
          campusCode: 'CT',
          campusName: 'FPT Can Tho',
          address: '600 Nguyễn Văn Cừ Nối Dài, An Bình, Ninh Kiều, Cần Thơ',
          isActive: true,
        },
        {
          campusCode: 'HN',
          campusName: 'FPT Hà Nội',
          address: 'Khu Giáo dục và Đào tạo, Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội',
          isActive: true,
        },
        {
          campusCode: 'HCM',
          campusName: 'FPT TP. Hồ Chí Minh',
          address: 'Lô E2a-7, Đường D1, Khu Công nghệ cao, P.Long Thạnh Mỹ, TP. Thủ Đức, TP. HCM',
          isActive: true,
        },
        {
          campusCode: 'DN',
          campusName: 'FPT Đà Nẵng',
          address: 'Khu đô thị công nghệ FPT Đà Nẵng, P. Hòa Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng',
          isActive: true,
        },
      ];

      const insertedCampuses = await campusModel.insertMany(campuses);
      console.log('✅ Inserted campuses:', insertedCampuses.length);

      // Create a sample admin user for Can Tho campus
      const canThoCampus = insertedCampuses.find(c => c.campusCode === 'CT');
      
      if (canThoCampus) {
        const adminUser = {
          email: 'admin@fpt.edu.vn',
          fullName: 'System Admin',
          role: UserRole.ADMIN,
          campusId: canThoCampus._id,
          employeeId: 'ADMIN001',
          department: 'IT Department',
          isActive: true,
        };

        const existingAdmin = await userModel.findOne({ email: adminUser.email });
        if (!existingAdmin) {
          await userModel.create(adminUser);
          console.log('✅ Created admin user: admin@fpt.edu.vn');
        }
      }
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
