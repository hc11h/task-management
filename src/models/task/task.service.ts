import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ITaskRepository } from './interfaces/task.repository.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, Task } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(
    @Inject('ITaskRepository') private readonly taskRepository: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    currentUser: { id: string; role: UserRole },
    createTaskDto: CreateTaskDto,
  ) {
    let assigneeId = createTaskDto.assigneeId;
    if (currentUser.role === UserRole.EMPLOYEE) {
      assigneeId = currentUser.id;
    } else if (currentUser.role === UserRole.MANAGER) {
      assigneeId = assigneeId ?? currentUser.id;
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
      });
      if (
        !assignee ||
        (assignee.id !== currentUser.id && assignee.role !== UserRole.EMPLOYEE)
      ) {
        throw new ForbiddenException();
      }
    }
    return this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      assigneeId,
      createdById: currentUser.id,
    });
  }

  async findAll(currentUser: { id: string; role: UserRole }) {
    if (currentUser.role === UserRole.EMPLOYEE) {
      return this.taskRepository.findAllByAssignee(currentUser.id);
    }
    return this.taskRepository.findAll();
  }

  async findOne(currentUser: { id: string; role: UserRole }, id: string) {
    const task = await this.taskRepository.findOne(id);
    if (!task) {
      throw new NotFoundException();
    }
    if (
      currentUser.role === UserRole.EMPLOYEE &&
      task.assigneeId !== currentUser.id
    ) {
      throw new UnauthorizedException();
    }
    if (currentUser.role === UserRole.MANAGER) {
      const t = task;
      const createdById = (t as unknown as { createdById: string }).createdById;
      const allowed =
        t.assigneeId === currentUser.id || createdById === currentUser.id;
      if (!allowed) {
        throw new ForbiddenException();
      }
    }
    return task;
  }

  async update(
    currentUser: { id: string; role: UserRole },
    id: string,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.taskRepository.findOne(id);
    if (!task) throw new NotFoundException();
    if (currentUser.role === UserRole.EMPLOYEE) {
      if (task.assigneeId !== currentUser.id) throw new ForbiddenException();
      const data: Partial<Task> = {};
      if (updateTaskDto.description !== undefined)
        data.description = updateTaskDto.description;
      if (updateTaskDto.status !== undefined)
        data.status = updateTaskDto.status;
      return this.taskRepository.update(id, data);
    }
    if (currentUser.role === UserRole.MANAGER) {
      const t = task;
      const createdById = (t as unknown as { createdById: string }).createdById;
      const allowed =
        t.assigneeId === currentUser.id || createdById === currentUser.id;
      if (!allowed) throw new ForbiddenException();
      const data: Partial<Task> = {};
      if (updateTaskDto.title !== undefined) data.title = updateTaskDto.title;
      if (updateTaskDto.description !== undefined)
        data.description = updateTaskDto.description;
      if (updateTaskDto.status !== undefined)
        data.status = updateTaskDto.status;
      return this.taskRepository.update(id, data);
    }
    return this.taskRepository.update(id, updateTaskDto as Partial<Task>);
  }

  async remove(currentUser: { id: string; role: UserRole }, id: string) {
    if (currentUser.role !== UserRole.ADMIN) throw new ForbiddenException();
    return this.taskRepository.delete(id);
  }
}
