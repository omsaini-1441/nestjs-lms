import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //~ SUPER_ADMIN — Get all users
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  //~ SUPER_ADMIN — Get specific user
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  //~ SUPER_ADMIN — Change role
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @Request() req,
  ) {
    return this.usersService.updateUserRole(
      id,
      dto.role,
      req.user.userId,
      req.user.role,
    );
  }

  //~ SUPER_ADMIN — Delete user
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}