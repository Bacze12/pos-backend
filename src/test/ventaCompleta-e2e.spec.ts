import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

describe('E2E Test Suite (Category -> Supplier -> Product -> Sales)', () => {
  let app: INestApplication;
  let connection: Connection;
  global.jwtToken = '';
  const itemsToCleanup = {
    categoryId: '',
    supplierId: '',
    productId: '',
    shiftId: '',
    saleIds: [] as string[],
  };

  const logger = new Logger('E2E Test Suite');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(new Logger());
    await app.init();

    connection = app.get('DatabaseConnection');
  });

  afterAll(async () => {
    if (connection) {
      try {
        // Obtener y loguear el estado final del shift antes de eliminar
        if (itemsToCleanup.shiftId) {
          const finalShift = await connection
            .collection('shifts')
            .findOne({ _id: new Types.ObjectId(itemsToCleanup.shiftId) });
          logger.log('Estado final del shift antes de eliminar:', finalShift);
        }

        // Eliminar los elementos en orden inverso a su creación
        if (itemsToCleanup.saleIds.length > 0) {
          for (const saleId of itemsToCleanup.saleIds) {
            if (Types.ObjectId.isValid(saleId)) {
              await connection.collection('sales').deleteOne({ _id: new Types.ObjectId(saleId) });
            }
          }
        }

        if (itemsToCleanup.shiftId) {
          await connection
            .collection('shifts')
            .deleteOne({ _id: new Types.ObjectId(itemsToCleanup.shiftId) });
        }

        if (itemsToCleanup.productId) {
          await connection
            .collection('products')
            .deleteOne({ _id: new Types.ObjectId(itemsToCleanup.productId) });
        }

        if (itemsToCleanup.supplierId) {
          await connection
            .collection('suppliers')
            .deleteOne({ _id: new Types.ObjectId(itemsToCleanup.supplierId) });
        }

        if (itemsToCleanup.categoryId) {
          await connection
            .collection('categories')
            .deleteOne({ _id: new Types.ObjectId(itemsToCleanup.categoryId) });
        }

        await connection.close();
      } catch (error) {
        logger.error('Error durante la limpieza:', error);
      }
    }
    if (app) {
      await app.close();
    }
  });

  it('Debe autenticar al usuario y obtener un token JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test1@gmail.com',
        password: 'password',
        businessName: 'John Doe',
      })
      .expect(201);

    global.jwtToken = response.body.access_token;
    logger.log(`JWT Token: ${global.jwtToken}`);
    expect(global.jwtToken).toBeDefined();
  });

  it('Debe crear una categoría', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${global.jwtToken}`)
      .send({
        name: 'Electrónica',
        description: 'Productos electrónicos',
        businessName: 'Test Business',
      })
      .expect(201);

    logger.log('Categoría creada:', response.body);
    itemsToCleanup.categoryId = response.body._id;
    expect(itemsToCleanup.categoryId).toBeDefined();
  });

  it('Debe crear un proveedor', async () => {
    const response = await request(app.getHttpServer())
      .post('/suppliers')
      .set('Authorization', `Bearer ${global.jwtToken}`)
      .send({
        name: 'Proveedor Ejemplo',
        email: 'supplier@example.com',
        phone: '+123456789',
        address: 'Calle Falsa 123',
        businessName: 'Test Business', // Añadido businessName
      })
      .expect(201);

    logger.log('Proveedor creado:', response.body);
    itemsToCleanup.supplierId = response.body._id;
    expect(itemsToCleanup.supplierId).toBeDefined();
  });

  it('Debe crear un producto', async () => {
    logger.log('Category ID:', itemsToCleanup.categoryId);
    logger.log('Supplier ID:', itemsToCleanup.supplierId);
    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${global.jwtToken}`)
      .send({
        name: 'Laptop',
        description: 'Laptop de última generación',
        purchasePrice: 1500.0,
        marginPercent: 30,
        stock: 10,
        categoryId: itemsToCleanup.categoryId,
        supplier: itemsToCleanup.supplierId,
        isIvaExempt: false,
        hasExtraTax: false,
        businessName: 'Test Business', // Añadido businessName
      })
      .expect(201);

    logger.log('Producto creado:', response.body);
    itemsToCleanup.productId = response.body._id;
    expect(itemsToCleanup.productId).toBeDefined();
  });

  it('Debe abrir una caja (Shift)', async () => {
    const response = await request(app.getHttpServer())
      .post('/shifts')
      .set('Authorization', `Bearer ${global.jwtToken}`)
      .send({
        initialCash: 500.0,
        startTime: new Date(),
        businessName: 'Test Business', // Añadido businessName
      })
      .expect(201);

    logger.log('Caja abierta (Shift):', response.body);
    itemsToCleanup.shiftId = response.body._id;
    expect(itemsToCleanup.shiftId).toBeDefined();
  });

  it('Debe realizar una venta', async () => {
    const response = await request(app.getHttpServer())
      .post('/sales')
      .set('Authorization', `Bearer ${global.jwtToken}`)
      .send({
        shift: itemsToCleanup.shiftId,
        items: [
          {
            product: itemsToCleanup.productId,
            quantity: 2,
            price: 1500.0,
            totalPrice: 3000.0,
          },
        ],
        total: 3000.0,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        businessName: 'Test Business', // Añadido businessName
      })
      .expect(201);

    logger.log('Venta realizada:', response.body);
    itemsToCleanup.saleIds.push(response.body._id);
    expect(response.body._id).toBeDefined();

    // Verificar el estado del shift después de la venta
    const shiftAfterSale = await connection
      .collection('shifts')
      .findOne({ _id: new Types.ObjectId(itemsToCleanup.shiftId) });
    logger.log('Estado del shift después de la venta:', shiftAfterSale);
  });

  it('Debe cerrar la caja (Shift)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/shifts/${itemsToCleanup.shiftId}/close`)
      .set('Authorization', `Bearer ${global.jwtToken}`)
      .send({
        finalCash: 3500.0,
        businessName: 'Test Business', // Añadido businessName
      })
      .expect(200);

    logger.log('Caja cerrada (Shift):', response.body);
    expect(response.body.status).toEqual('CLOSED');

    // Verificar el estado final del shift
    const finalShift = await connection
      .collection('shifts')
      .findOne({ _id: new Types.ObjectId(itemsToCleanup.shiftId) });
    logger.log('Estado final del shift después de cerrar:', finalShift);
  });
});
