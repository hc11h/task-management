import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TaskRepository } from './repositories/task.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TaskController],
  providers: [
    TaskService,
    TaskRepository,
    { provide: 'ITaskRepository', useClass: TaskRepository },
  ],
})
export class TaskModule {}
