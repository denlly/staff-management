import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth and Records (e2e)', () => {
  let app: INestApplication<App>;
  let token = '';
  let recordId = '';

  beforeAll(async () => {
    process.env.DB_PATH = ':memory:';
    process.env.JWT_SECRET = 'test-secret';
    process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect((res: { body: { message: string } }) => {
        expect(res.body.message).toContain('API is running');
      });
  });

  it('POST /api/auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Tester',
        email: 'tester@example.com',
        password: '123456',
      });

    const body = response.body as { accessToken: string };
    expect(response.status).toBe(201);
    expect(body.accessToken).toBeDefined();
    token = body.accessToken;
  });

  it('POST /api/records and GET /api/records', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'First Record',
        content: 'This is a test record',
      });

    const createBody = createResponse.body as { id: string };
    expect(createResponse.status).toBe(201);
    recordId = createBody.id;

    const listResponse = await request(app.getHttpServer())
      .get('/api/records')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    const listBody = listResponse.body as Array<{ id: string }>;
    expect(Array.isArray(listBody)).toBe(true);
    expect(listBody.length).toBeGreaterThan(0);
  });

  it('PATCH /api/records/:id and DELETE /api/records/:id', async () => {
    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Title',
      });

    const updateBody = updateResponse.body as { title: string };
    expect(updateResponse.status).toBe(200);
    expect(updateBody.title).toBe('Updated Title');

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);
  });
});
