import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '@/database/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  /**
   * Create new user (admin creates user before they login)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, campusId } = createUserDto;

    // Check if email already exists
    const existingUser = await this.userModel
      .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      .exec();

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    // Validate campusId if provided
    if (campusId) {
      if (!Types.ObjectId.isValid(campusId)) {
        throw new BadRequestException('Campus ID không hợp lệ');
      }
    }

    // Create user with empty googleId (will be filled when they login)
    const newUser = new this.userModel({
      ...createUserDto,
      googleId: null, // Empty googleId - will be set on first login
      isActive: true,
      campusId: campusId ? new Types.ObjectId(campusId) : undefined,
    });

    return newUser.save();
  }

  /**
   * Get all users with optional filters
   */
  async findAll(filterDto?: FilterUserDto): Promise<User[]> {
    const query: any = {};

    if (filterDto?.role) {
      query.role = filterDto.role;
    }

    if (filterDto?.campusId) {
      if (!Types.ObjectId.isValid(filterDto.campusId)) {
        throw new BadRequestException('Campus ID không hợp lệ');
      }
      query.campusId = new Types.ObjectId(filterDto.campusId);
    }

    if (filterDto?.isActive !== undefined) {
      query.isActive = filterDto.isActive;
    }

    if (filterDto?.search) {
      query.$or = [
        { fullName: { $regex: filterDto.search, $options: 'i' } },
        { email: { $regex: filterDto.search, $options: 'i' } },
        { employeeId: { $regex: filterDto.search, $options: 'i' } },
        { studentId: { $regex: filterDto.search, $options: 'i' } },
      ];
    }

    return this.userModel
      .find(query)
      .select('-faceData -fingerprintData -googleId')
      .populate('campusId', 'campusCode campusName address')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get user by ID
   */
  async findOne(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const user = await this.userModel
      .findById(id)
      .select('-faceData -fingerprintData -googleId')
      .populate('campusId', 'campusCode campusName address')
      .exec();

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với ID: ${id}`);
    }

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email) {
      const existingUser = await this.userModel
        .findOne({
          email: { $regex: new RegExp(`^${updateUserDto.email}$`, 'i') },
          _id: { $ne: id },
        })
        .exec();

      if (existingUser) {
        throw new ConflictException('Email đã được sử dụng bởi user khác');
      }
    }

    // Validate campusId if provided
    if (updateUserDto.campusId) {
      if (!Types.ObjectId.isValid(updateUserDto.campusId)) {
        throw new BadRequestException('Campus ID không hợp lệ');
      }
      (updateUserDto as any).campusId = new Types.ObjectId(
        updateUserDto.campusId,
      );
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-faceData -fingerprintData -googleId')
      .populate('campusId', 'campusCode campusName address')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy user với ID: ${id}`);
    }

    return updatedUser;
  }

  /**
   * Delete user (soft delete - set isActive to false)
   */
  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const result = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(`Không tìm thấy user với ID: ${id}`);
    }
  }

  /**
   * Activate user
   */
  async activate(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .select('-faceData -fingerprintData -googleId')
      .populate('campusId', 'campusCode campusName address')
      .exec();

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với ID: ${id}`);
    }

    return user;
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const total = await this.userModel.countDocuments();
    const active = await this.userModel.countDocuments({ isActive: true });
    const inactive = await this.userModel.countDocuments({ isActive: false });

    const byRole = await this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      total,
      active,
      inactive,
      byRole: byRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }
}
