import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { bootstrapE2E } from './setup-e2e';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await bootstrapE2E());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.reviewLike.deleteMany(),
      prisma.userFollow.deleteMany(),
      prisma.userBookStatus.deleteMany(),
      prisma.refreshToken.deleteMany(),
      prisma.review.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  describe('/users (POST)', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'email@example.com',
        name: 'Test',
        password: '123456',
      };
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: createUserDto.name,
        email: createUserDto.email,
        profilePicture: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('/users (GET)', () => {
    const createUserDto: CreateUserDto = {
      email: 'email@example.com',
      name: 'Test',
      password: '123456',
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);
    });

    it('/users/me', async () => {
      const loginRes = await request(app.getHttpServer()).post('/auth').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });
      const jwtToken = loginRes.body.accessToken;

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: createUserDto.name,
        email: createUserDto.email,
        profilePicture: null,
        createdAt: expect.any(String),
        followersCount: 0,
        followingCount: 0,
        readBooksCount: 0,
        isFollowing: false,
        recentReviews: [],
      });
    });
  });

  it('/users (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
