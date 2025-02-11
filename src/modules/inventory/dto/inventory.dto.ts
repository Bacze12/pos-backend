import { IsMongoId, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { InventoryMovementType } from '../inventory.schema';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class CreateInventoryDto
 * @description Data transfer object for creating inventory entries.
 */
export class CreateInventoryDto {
  /**
   * @property {string} productId
   * @description The ID of the product associated with the inventory entry.
   * @example '60d0fe4f531123a8b4f78901'
   */
  @IsMongoId()
  productId: string;

  /**
   * @property {string} userId
   * @description The ID of the user associated with the inventory entry.
   * @example '5f8d7372a3e9b8c4d4a12345'
   */
  @IsMongoId()
  userId: string;

  /**
   * @property {number} quantity
   * @description The quantity of the product being added or removed from inventory. Must be a positive integer.
   * @minimum 1
   * @example 10
   */
  @IsInt()
  @Min(1)
  quantity: number;

  /**
   * @property {InventoryMovementType} type
   * @description The type of inventory movement (IN or OUT).
   * @enum {InventoryMovementType}
   * @example InventoryMovementType.IN
   */
  @IsEnum(InventoryMovementType)
  @ApiProperty({
    enum: InventoryMovementType,
    description: 'Type of inventory movement',
    example: InventoryMovementType.IN,
    required: true,
  })
  type: InventoryMovementType;

  /**
   * @property {string} [notes]
   * @description Optional notes or comments related to the inventory movement.
   * @example 'Received new stock from supplier'
   */
  @IsOptional()
  notes?: string;
}
