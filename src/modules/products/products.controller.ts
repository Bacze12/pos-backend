import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductDto } from './products.dto';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private getTenantIdFromRequest(req): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Falta tenantId en el contexto del usuario.');
    }
    return tenantId;
  }

  @Get('')
  @ApiOperation({
    summary: 'Obtener todos los productos',
    description: 'Devuelve una lista de productos para el tenant actual.',
  })
  @ApiResponse({ status: 200, description: 'Productos recuperados con éxito.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Falta el tenantId o el token JWT es inválido.',
  })
  async getProducts(@Req() req) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.productsService.findAll(tenantId);
  }

  @Post('')
  @ApiOperation({
    summary: 'Crear un nuevo producto',
    description: 'Crea un producto asociado al tenant actual.',
  })
  @ApiResponse({ status: 201, description: 'Producto creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Falta el tenantId o el token JWT es inválido.',
  })
  async createProduct(@Req() req, @Body() productData: CreateProductDto) {
    const tenantId = this.getTenantIdFromRequest(req);

    try {
      const createdProduct = await this.productsService.create({
        ...productData,
        tenantId,
      });

      // Responder con el producto creado y un código HTTP 201
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
}
