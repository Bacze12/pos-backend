import { Test, TestingModule } from '@nestjs/testing';
import { ShiftService } from '../../modules/shift/shift.service';
import { ShiftRepository } from '../../modules/shift/repositories/shift.repository';
import { Types } from 'mongoose';

describe('ShiftService', () => {
  let service: ShiftService;
  let repository: ShiftRepository;

  const mockShiftRepository = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOpenShift: jest.fn(),
    getShiftSales: jest.fn(),
    assignUsersToShift: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftService,
        {
          provide: ShiftRepository,
          useValue: mockShiftRepository,
        },
      ],
    }).compile();

    service = module.get<ShiftService>(ShiftService);
    repository = module.get<ShiftRepository>(ShiftRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of shifts', async () => {
      const result = ['shift1', 'shift2'];
      jest.spyOn(repository, 'findAll').mockResolvedValue(result as any);
      expect(await service.findAll('tenant1')).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a shift', async () => {
      const shift = { id: '1', status: 'OPEN' };
      jest.spyOn(repository, 'create').mockResolvedValue(shift as any);
      expect(await service.create('tenant1', 'test@email.com', {})).toBe(shift);
    });
  });

  describe('update', () => {
    it('should update a shift', async () => {
      const shift = { id: '1', status: 'OPEN' };
      jest.spyOn(repository, 'update').mockResolvedValue(shift as any);
      expect(await service.update('tenant1', '1', {})).toBe(shift);
    });
  });

  describe('delete', () => {
    it('should delete a shift', async () => {
      const result = { deleted: true };
      jest.spyOn(repository, 'delete').mockResolvedValue(result);
      expect(await service.delete('tenant1', '1')).toBe(result);
    });
  });

  describe('closeShift', () => {
    it('should close a shift', async () => {
      const mockShift = {
        status: 'OPEN',
        startTime: new Date(),
        save: jest.fn().mockResolvedValue({ status: 'CLOSED' }),
      };
      const mockSales = [{ _id: new Types.ObjectId() }];

      jest.spyOn(repository, 'findOpenShift').mockResolvedValue(mockShift as any);
      jest.spyOn(repository, 'getShiftSales').mockResolvedValue(mockSales as any);

      const result = await service.closeShift('tenant1', 'test@email.com', '1', 100);
      expect(result.status).toBe('CLOSED');
    });

    it('should throw error if shift not found', async () => {
      jest.spyOn(repository, 'findOpenShift').mockResolvedValue(null);

      await expect(service.closeShift('tenant1', 'test@email.com', '1', 100)).rejects.toThrow(
        'Shift no encontrado, ya está cerrado o usuario no autorizado',
      );
    });
  });

  describe('assignUsersToShift', () => {
    it('should assign users to shift', async () => {
      const shift = { id: '1', users: ['user1'] };
      jest.spyOn(repository, 'assignUsersToShift').mockResolvedValue(shift as any);
      expect(await service.assignUsersToShift('tenant1', '1', ['user1'])).toBe(shift);
    });
  });
});
