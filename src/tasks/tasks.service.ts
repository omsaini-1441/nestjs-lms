import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User, UserRole } from '../users/entities/user.entity';
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

  //~ Helper: Check if role is elevated (ADMIN or SUPER_ADMIN)
  private isElevated(role: UserRole): boolean {
    return [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role);
  }

  //~ CREATE (any authenticated user can create their own task)
  async create(
    dto: CreateTaskDto,
    userId: number,
    role: UserRole,
  ): Promise<Task> {
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

  //~ READ ALL
  //? USER → only their tasks
  //? ADMIN / SUPER_ADMIN → all tasks

  async findAll(userId: number, role: UserRole): Promise<Task[]> {
    if (this.isElevated(role)) {
      return this.taskRepo.find({
        relations: ['user'],
        order: { id: 'DESC' },
      });
    }

    return this.taskRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  //~ READ ONE
  //? USER → only if owns task
  //? ADMIN / SUPER_ADMIN → any task

  async findOne(id: number, userId: number, role: UserRole): Promise<Task> {
    let task: Task | null;

    if (this.isElevated(role)) {
      task = await this.taskRepo.findOne({
        where: { id },
        relations: ['user'],
      });
    } else {
      task = await this.taskRepo.findOne({
        where: { id, user: { id: userId } },
        relations: ['user'],
      });
    }

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  //~ UPDATE
  //? USER → can update only own task
  //? ADMIN / SUPER_ADMIN → can update any task

  async update(
    id: number,
    dto: UpdateTaskDto,
    userId: number,
    role: UserRole,
  ): Promise<Task> {
    const task = await this.findOne(id, userId, role);

    //* If user is not elevated, ensure ownership
    if (!this.isElevated(role) && task.user.id !== userId) {
      throw new ForbiddenException('You cannot update this task');
    }

    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  //~ DELETE
  //? USER → can delete only own task
  //? ADMIN / SUPER_ADMIN → can delete any task

  async remove(
    id: number,
    userId: number,
    role: UserRole,
  ): Promise<{ message: string }> {
    const task = await this.findOne(id, userId, role);

    if (!this.isElevated(role) && task.user.id !== userId) {
      throw new ForbiddenException('You cannot delete this task');
    }

    await this.taskRepo.remove(task);

    return {
      message: `task: "${task.description}" deleted successfully`,
    };
  }
}
