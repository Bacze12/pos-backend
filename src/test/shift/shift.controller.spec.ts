import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsController } from '../../modules/shift/shift.controller';
import { ShiftService } from '../../modules/shift/shift.service';
import { CreateShiftDto, CloseShiftDto } from '../../modules/shift/dto/shift.dto';

describe('ShiftsController', () => {
  let controller: ShiftsController;
  let _shiftService: ShiftService;

  const mockShiftService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    closeShift: jest.fn(),
  };

  const tenantId = 'tenant1';
  const email = 'user@example.com';
  const shiftId = 'shift1';

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ShiftsController],
      providers: [
        {
          provide: ShiftService,
          useValue: mockShiftService,
        },
      ],
    }).compile();

    controller = moduleRef.get<ShiftsController>(ShiftsController);
    _shiftService = moduleRef.get<ShiftService>(ShiftService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShift', () => {
    it('should create a shift', async () => {
      const shiftData: CreateShiftDto = {
        /* add proper fields as needed */
      } as CreateShiftDto;
      const expectedResult = { id: 'newShift' };
      mockShiftService.create.mockResolvedValue(expectedResult);

      const result = await controller.createShift(tenantId, email, shiftData);
      expect(result).toEqual(expectedResult);
      expect(mockShiftService.create).toHaveBeenCalledWith(tenantId, email, shiftData);
    });
  });

  describe('updateShift', () => {
    it('should update a shift', async () => {
      const updateData = { field: 'value' };
      const expectedResult = { id: shiftId, updated: true };
      mockShiftService.update.mockResolvedValue(expectedResult);

      const result = await controller.updateShift(tenantId, shiftId, updateData);
      expect(result).toEqual(expectedResult);
      expect(mockShiftService.update).toHaveBeenCalledWith(tenantId, shiftId, updateData);
    });
  });

  describe('deleteShift', () => {
    it('should delete a shift', async () => {
      const expectedResult = { deleted: true };
      mockShiftService.delete.mockResolvedValue(expectedResult);

      const result = await controller.deleteShift(tenantId, shiftId);
      expect(result).toEqual(expectedResult);
      expect(mockShiftService.delete).toHaveBeenCalledWith(tenantId, shiftId);
    });
  });

  describe('closeShift', () => {
    it('should close a shift', async () => {
      const closeData: CloseShiftDto = { finalCash: 1000 } as CloseShiftDto;
      const expectedResult = { id: shiftId, closed: true };
      mockShiftService.closeShift.mockResolvedValue(expectedResult);

      const result = await controller.closeShift(tenantId, email, shiftId, closeData);
      expect(result).toEqual(expectedResult);
      expect(mockShiftService.closeShift).toHaveBeenCalledWith(
        tenantId,
        email,
        shiftId,
        closeData.finalCash,
      );
    });
  });
});
