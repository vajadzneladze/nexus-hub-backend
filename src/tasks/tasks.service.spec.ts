import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  const prismaMock = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('maps categoryName to relation update payload', async () => {
    prismaMock.task.update.mockResolvedValue({ id: '1' });

    await service.update('1', {
      title: 'Updated title',
      categoryName: 'Work',
    });

    expect(prismaMock.task.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        title: 'Updated title',
        category: {
          connectOrCreate: {
            where: { name: 'Work' },
            create: { name: 'Work' },
          },
        },
      },
    });
  });

  it('disconnects category when categoryName is empty', async () => {
    prismaMock.task.update.mockResolvedValue({ id: '1' });

    await service.update('1', {
      categoryName: '   ',
    });

    expect(prismaMock.task.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        category: { disconnect: true },
      },
    });
  });
});
