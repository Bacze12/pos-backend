import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/inventory.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create inventory item' })
  @ApiResponse({ status: 201, description: 'The inventory has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createInventoryDto: CreateInventoryDto): Promise<any> {
    return await this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items' })
  @ApiResponse({ status: 200, description: 'List of all inventory items.' })
  @ApiResponse({ status: 404, description: 'No inventory items found.' })
  async findAll(): Promise<any[]> {
    return await this.inventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by id' })
  @ApiResponse({ status: 200, description: 'The found inventory item.' })
  @ApiResponse({ status: 404, description: 'Inventory item not found.' })
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.inventoryService.findById(id);
  }
}
