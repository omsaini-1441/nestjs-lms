import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

    @InjectRepository(EmailVerificationToken)
    private tokenRepo: Repository<EmailVerificationToken>,
  ) {}

  // async register(registerDto: RegisterDto) {
  //   const { username, password } = registerDto;

  //   const userExists = await this.usersService.findOneByUsername(username);
  //   if (userExists) {
  //     throw new UnauthorizedException('Username already exists');
  //   }

  //   const user = await this.usersService.create({ username, password });
  //   const token = this.generateToken(user.id);

  //   return { user: { id: user.id, username: user.username }, token };
  // }
  //~ REGISTER USER
  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    //* check if user  email exists
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(registerDto);

    //* genrate token string
    const token = randomBytes(32).toString('hex');

    //* expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); //! set 1 hour expiry

    const verificationToken = this.tokenRepo.create({
      token,
      expiresAt,
      user,
    });

    await this.tokenRepo.save(verificationToken);

    //TODO: send actual email here

    return { message: 'User registered. Please Verify your email.' };
  }

  //~ VERIFY EMAIL
  async verifyEmail(token: string) {
    const record = await this.tokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });
    //* validate token
    if (!record) {
      throw new BadRequestException('Invalid Token');
    }
    //* check expiry
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token Expired');
    }

    //* mark user verified
    await this.usersService.markEmailVerified(record.user.id);

    //* delete token
    await this.tokenRepo.delete(record.id);

    return {
      message: 'Email verified successfully',
    };
  }

  //~ LOGIN USER
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.role);
    return {
      user: { id: user.id, username: user.username, userrole: user.role },
      token,
    };
  }

  //~ GENERATE JWT TOKEN
  private generateToken(userId: number, userRole: string) {
    return this.jwtService.sign({ sub: userId, role: userRole });
  }

  //~ LOGOUT USER
  logout() {
    //  you can implement token blacklisting on the server side if needed.

    return { message: 'Logged out successfully' };
  }
}
