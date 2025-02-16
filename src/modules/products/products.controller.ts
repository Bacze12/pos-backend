import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Logger,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductDto } from './dto/products.dto';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { TenantId } from '../../common/decorator/tenant-id.decorator';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los productos',
    description: 'Devuelve una lista de productos para el tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Productos recuperados con éxito.' })
  async getProducts(@TenantId() tenantId: string) {
    return this.productsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un producto',
    description: 'Devuelve un producto para el tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Producto recuperado con éxito.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async getProduct(@TenantId() tenantId: string, @Param('id') id: string) {
    const product = await this.productsService.findById(tenantId, id);
    if (!product) {
      throw new BadRequestException('Producto no encontrado.');
    }

    return product;
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo producto',
    description: 'Crea un producto asociado al tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Producto creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async createProduct(@TenantId() tenantId: string, @Body() productData: CreateProductDto) {
    try {
      const createdProduct = await this.productsService.create({
        ...productData,
        tenantId,
      });

      return {
        statusCode: 201,
        message: 'Producto creado con éxito.',
        data: createdProduct,
      };
    } catch (error) {
      Logger.error('Error al crear el producto:', error.message);
      throw new BadRequestException(error.message || 'Error al crear el producto.');
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un producto',
    description: 'Elimina un producto asociado al tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Producto eliminado con éxito.' })
  @ApiResponse({ status: 400, description: 'Error al eliminar el producto.' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    try {
      await this.productsService.deleteProduct(tenantId, id);
      return {
        statusCode: 200,
        message: 'Producto eliminado con éxito.',
      };
    } catch (error) {
      Logger.error('Error al eliminar el producto:', error.message);
      throw new BadRequestException(error.message || 'Error al eliminar el producto.');
    }
  }
}
