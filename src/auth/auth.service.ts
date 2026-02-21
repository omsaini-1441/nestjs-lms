import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';



@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, password } = registerDto;

    const userExists = await this.usersService.findOneByUsername(username);
    if (userExists) {
      throw new UnauthorizedException('Username already exists');
    }

    const user = await this.usersService.create({ username, password });
    const token = this.generateToken(user.id);

    return { user: { id: user.id, username: user.username }, token };
  }

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

    const token = this.generateToken(user.id);
    return { user: { id: user.id, username: user.username }, token };
  }

  private generateToken(userId: number) {
    return this.jwtService.sign({ sub: userId });
  }
}



