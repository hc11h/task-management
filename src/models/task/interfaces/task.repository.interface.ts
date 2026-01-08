import { Task } from '@prisma/client';

export interface ITaskRepository {
  create(data: {
    title: string;
    description?: string;
    assigneeId?: string;
    createdById: string;
  }): Promise<Task>;
  findAll(): Promise<Task[]>;
  findAllByAssignee(assigneeId: string): Promise<Task[]>;
  findOne(id: string): Promise<Task | null>;
  update(id: string, data: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<Task>;
}
