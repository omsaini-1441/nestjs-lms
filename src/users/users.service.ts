import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // async create(dto: CreateUserDto): Promise<User> {
  //   const user = this.userRepo.create(dto);
  //   return this.userRepo.save(user);
  // }
  //~ CREATE USER
  async create(data: RegisterDto) {
    const hashedpassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      username: data.username,
      email: data.email,
      password: hashedpassword,
      isEmailVerified: false,
      role: UserRole.USER
    });

    return this.userRepo.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['tasks'], // include tasks
    });
  }

  //~ FIND ONE USER
  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['tasks'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  //~ UPDATE USER
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  //~ MARK EMAIL VERIFIED
  async markEmailVerified(userId: number) {
    return this.userRepo.update(userId, {
      isEmailVerified: true,
    });
  }

  //~ REMOVE USER
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  //~ FIND ONE USER BY USERNAME
  // users.service.ts
  async findOneByUsername(username: string) {
    return this.userRepo.findOne({ where: { username } });
  }

  //~ FIND ONE USER BY EMAIL
  async findOneByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }
}
