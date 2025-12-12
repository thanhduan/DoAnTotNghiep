import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user.schema';
import { Campus } from '@/database/schemas/campus.schema';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from '@/common/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Campus.name) private campusModel: Model<Campus>,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate and login user with Google
   */
  async validateGoogleUser(
    googleProfile: any,
    campusId: string,
  ): Promise<AuthResponseDto> {
    const { googleId, email, fullName, avatar } = googleProfile;

    // Normalize email to lowercase for comparison
    const normalizedEmail = email.toLowerCase();

    // 1. Validate campus exists
    const campus = await this.campusModel.findById(campusId);
    if (!campus || !campus.isActive) {
      throw new BadRequestException('Invalid or inactive campus');
    }

    // 2. Find user by email (case-insensitive)
    let user = await this.userModel
      .findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } })
      .populate('campusId', 'campusCode campusName address')
      .exec();

    if (!user) {
      throw new UnauthorizedException(
        'Email not found in system. Please contact administrator.',
      );
    }

    // 3. Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // 4. Update googleId and campusId if first time login with Google
    if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = avatar || user.avatar;
      
      // Only update campusId if user doesn't have one yet
      if (!user.campusId) {
        user.campusId = campusId as any;
      }
      
      await user.save();
    } else {
      // Update avatar if changed
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    // 5. Generate JWT token
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // 6. Populate campus data for frontend
    const populatedUser = await this.userModel
      .findById(user._id)
      .populate('campusId', 'campusCode campusName address')
      .exec();

    // 7. Return response
    return {
      success: true,
      accessToken,
      user: {
        id: populatedUser._id.toString(),
        email: populatedUser.email,
        fullName: populatedUser.fullName,
        avatar: populatedUser.avatar,
        role: populatedUser.role,
        campusId: populatedUser.campusId, // Return full campus object
      },
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-faceData -fingerprintData -googleId')
      .populate('campusId', 'campusCode campusName address')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  /**
   * Logout (invalidate token - can be implemented with Redis)
   */
  async logout(userId: string) {
    // TODO: Implement token blacklist with Redis
    // For now, just return success (client will remove token)
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
