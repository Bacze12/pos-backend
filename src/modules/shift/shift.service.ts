import { Injectable } from '@nestjs/common';
import { ShiftRepository } from './repositories/shift.repository';
import { Shift } from './shift.schema';
import { Types } from 'mongoose';

@Injectable()
export class ShiftService {
  constructor(private readonly shiftRepository: ShiftRepository) {}

  /**
   * Retrieves all shifts for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @returns A list of shifts.
   */
  async findAll(tenantId: string): Promise<Shift[]> {
    return this.shiftRepository.findAll(tenantId);
  }

  /**
   * Creates a new shift for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param email - The email of the user creating the shift.
   * @param shiftData - The data for the new shift.
   * @returns The created shift.
   */
  async create(tenantId: string, email: string, shiftData: any): Promise<Shift> {
    return this.shiftRepository.create(tenantId, email, shiftData);
  }

  /**
   * Updates an existing shift for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift to update.
   * @param updateData - The data to update the shift with.
   * @returns The updated shift.
   */
  async update(tenantId: string, shiftId: string, updateData: any): Promise<Shift> {
    return this.shiftRepository.update(tenantId, shiftId, updateData);
  }

  /**
   * Deletes a shift for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift to delete.
   * @returns The result of the deletion.
   */
  async delete(tenantId: string, shiftId: string): Promise<any> {
    return this.shiftRepository.delete(tenantId, shiftId);
  }

  /**
   * Closes a shift for a given tenant and user.
   * @param tenantId - The ID of the tenant.
   * @param email - The email of the user closing the shift.
   * @param shiftId - The ID of the shift to close.
   * @param finalCash - The final cash amount at the end of the shift.
   * @returns The closed shift.
   */
  async closeShift(
    tenantId: string,
    email: string,
    shiftId: string,
    finalCash: number,
  ): Promise<Shift> {
    const shift = await this.shiftRepository.findOpenShift(tenantId, email, shiftId);

    if (!shift) {
      throw new Error('Shift no encontrado, ya está cerrado o usuario no autorizado');
    }

    const shiftSales = await this.shiftRepository.getShiftSales(tenantId, shiftId, shift.startTime);

    shift.status = 'CLOSED';
    shift.finalCash = finalCash;
    shift.endTime = new Date();
    shift.sales = shiftSales.map((sale) => sale._id as Types.ObjectId);

    return shift.save();
  }

  /**
   * Assigns users to a shift for a given tenant.
   * @param tenantId - The ID of the tenant.
   * @param shiftId - The ID of the shift.
   * @param userIds - The IDs of the users to assign to the shift.
   * @returns The updated shift with assigned users.
   */
  async assignUsersToShift(tenantId: string, shiftId: string, userIds: string[]): Promise<Shift> {
    return this.shiftRepository.assignUsersToShift(tenantId, shiftId, userIds);
  }
}
