import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    request.user = { id: '123', username: 'testuser' };
    return true;
  }
}

describe('UsersController', () => {
  let serviceMock: DeepMockProxy<UsersService>;
  let controller: UsersController;

  beforeEach(async () => {
    serviceMock = mockDeep<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: serviceMock,
        },
        Reflector,
      ],
    })
      .overrideGuard(MockJwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const argument = { key: 'value' }; // fake body
      const expected = { anyKey: 'anyValue' }; // fake response

      jest.spyOn(serviceMock, 'create').mockResolvedValue(expected as any);

      const result = await controller.createUser(argument as any);

      expect(serviceMock.create).toHaveBeenCalledWith(argument);
      expect(result).toEqual(expected);
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const expected = [{ anyKey: 'anyValue' }];

      jest.spyOn(serviceMock, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.getAllUsers();

      expect(serviceMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('getMe', () => {
    const id = '123';
    const mockUser = { id, username: 'testuser' };

    it('should get the authenticated user profile', async () => {
      const expected = { key: 'value' };

      jest
        .spyOn(serviceMock, 'getFullUserProfile')
        .mockResolvedValue(expected as any);

      const result = await controller.getMe(mockUser as any);

      expect(serviceMock.getFullUserProfile).toHaveBeenCalledWith(id, id);
      expect(result).toEqual(expected);
    });
  });
});
