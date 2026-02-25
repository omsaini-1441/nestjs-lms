import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() dto: CreateGroupDto, @Req() req) {
    return this.groupsService.create(dto, req.user);
  }

  @Post(':id/join')
  join(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.groupsService.join(id, req.user);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }
}
