import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = await this.hashingService.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        profilePicture: dto.profilePicture ?? null,
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => new UserResponseDto(user));
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        profilePicture: dto.profilePicture,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
