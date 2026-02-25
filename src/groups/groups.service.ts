import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMember, GroupRole } from './entities/group-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,

    @InjectRepository(GroupMember)
    private memberRepo: Repository<GroupMember>,
  ) {}

  //~ CREATE GROUP
  async create(createGroupDto: CreateGroupDto, user: User) {
    const group = this.groupRepo.create({
      ...createGroupDto,
      createdBy: user,
    });

    const savedGroup = await this.groupRepo.save(group);

    //* creator becomes ADMIN
    const membership = this.memberRepo.create({
      user,
      group: savedGroup,
      role: GroupRole.ADMIN,
    });

    await this.memberRepo.save(membership);

    return savedGroup;
  }

  //~ JOIN GROUP
  async join(groupId: number, user: User) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) throw new NotFoundException('Group not found');

    if (group.visibility === 'PRIVATE') {
      throw new ForbiddenException('Cannot join private group');
    }

    if (group.maxMembers && group.members.length >= group.maxMembers) {
      throw new ForbiddenException('Group is full');
    }

    const membership = this.memberRepo.create({
      user,
      group,
    });

    return this.memberRepo.save(membership);
  }

  //~ FIND ALL
  async findAll() {
    return this.groupRepo.find();
  }

  //~ FIND ONE
  async findOne(id: number) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!group) throw new NotFoundException('Group not found');

    return group;
  }
}
