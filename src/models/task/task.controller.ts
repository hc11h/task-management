import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import crypto from 'crypto';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  private parseUser(req: Request) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return null;
    const [h, p, s] = token.split('.');
    const unsigned = `${h}.${p}`;
    const secret = process.env.JWT_SECRET ?? 'dev_secret';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(unsigned)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (expected !== s) return null;
    const payloadJson = Buffer.from(
      p.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString();
    const parsed: unknown = JSON.parse(payloadJson);
    const payload = parsed as { sub: string; role: UserRole };
    return { id: payload.sub, role: payload.role };
  }

  @Post()
  create(@Req() req: Request, @Body() createTaskDto: CreateTaskDto) {
    const user = this.parseUser(req);
    return this.taskService.create(user!, createTaskDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = this.parseUser(req);
    return this.taskService.findAll(user!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = this.parseUser(req);
    return this.taskService.findOne(user!, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const user = this.parseUser(req);
    return this.taskService.update(user!, id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = this.parseUser(req);
    return this.taskService.remove(user!, id);
  }
}
