import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  //~ CREATE (secure)
  async create(dto: CreateTaskDto, userId: number): Promise<Task> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      user,
    });

    return this.taskRepo.save(task);
  }

  //~ READ ALL (only tasks of logged-in user)
  async findAllByUser(userId: number): Promise<Task[]> {
    return this.taskRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  //~ READ ONE (must belong to logged-in user)
  async findOneByUser(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  //~ UPDATE (only if task belongs to logged-in user)
  async update(
    id: number,
    dto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    const task = await this.findOneByUser(id, userId);

    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  //~ DELETE (only if task belongs to logged-in user)
  async remove(id: number, userId: number): Promise<object> {
    const task = await this.findOneByUser(id, userId);
    await this.taskRepo.remove(task);
    return {
      message: `task: "${task.description}" deleted successfully`
    }
  }
}
