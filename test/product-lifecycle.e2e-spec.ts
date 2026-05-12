import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CategoryResponseDto } from 'src/modules/category/presentation/dtos/category-response.dto';
import { ProductResponseDto } from 'src/modules/product/presentation/dtos/product-response.dto';

async function truncateTables(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    TRUNCATE TABLE product_categories, product_attributes, audit_logs, products, categories
    RESTART IDENTITY CASCADE
  `);
}

describe('Product Lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateTables(dataSource);
  });

  it('should complete the full lifecycle: create → add category → add attribute → activate', async () => {
    const categoryRes = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Eletrônicos' })
      .expect(201);

    const categoryId: string = (categoryRes.body as CategoryResponseDto).id;
    expect(categoryId).toBeDefined();

    const productRes = await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Smartphone XYZ', description: 'High-end smartphone' })
      .expect(201);

    const productId: string = (productRes.body as ProductResponseDto).id;
    expect(productId).toBeDefined();

    await request(app.getHttpServer())
      .post(`/products/${productId}/categories`)
      .send({ categoryId })
      .expect(204);

    await request(app.getHttpServer())
      .post(`/products/${productId}/attributes`)
      .send({ key: 'color', value: 'black' })
      .expect(204);

    await request(app.getHttpServer())
      .post(`/products/${productId}/activate`)
      .expect(204);

    const getRes = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200);

    expect((getRes.body as ProductResponseDto).status).toBe('ACTIVE');
    expect((getRes.body as ProductResponseDto).categoryIds).toContain(
      categoryId,
    );
    expect((getRes.body as ProductResponseDto).attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'color', value: 'black' }),
      ]),
    );
  });
});
