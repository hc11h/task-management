import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Task } from '@prisma/client';
import type { ITaskRepository } from '../interfaces/task.repository.interface';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    assigneeId?: string;
    createdById: string;
  }) {
    return this.prisma.task.create({ data });
  }

  async findAll() {
    return this.prisma.task.findMany({
      include: { assignee: true }, // Include user data by default
    });
  }

  async findAllByAssignee(assigneeId: string) {
    return this.prisma.task.findMany({
      where: { assigneeId },
      include: { assignee: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { assignee: true },
    });
  }

  async update(id: string, data: Partial<Task>) {
    return this.prisma.task.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}
