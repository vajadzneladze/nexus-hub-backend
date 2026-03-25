import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: TaskStatus.PENDING,

        category: createTaskDto.categoryName
          ? {
              connectOrCreate: {
                where: { name: createTaskDto.categoryName },
                create: { name: createTaskDto.categoryName },
              },
            }
          : undefined,
      },
      include: { category: true },
    });
  }
  // create(createTaskDto: CreateTaskDto) {
  //   return 'This action adds a new task';
  // }

  findAll() {
    return this.prisma.task.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id: id.toString() },
      include: { category: true },
    });
    // return `This action returns a #${id} task`;
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id: id.toString() },
      data: updateTaskDto,
    });
    // return `This action updates a #${id} task`;
  }

  remove(id: string) {
    return this.prisma.task.delete({
      where: { id: id.toString() },
    });
    // return `This action removes a #${id} task`;
  }
}
