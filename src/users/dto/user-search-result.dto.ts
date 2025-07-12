import { User } from 'generated/prisma';

type UserData = Omit<User, 'passwordHash' | 'role' | 'updatedAt'>;

export class UserSearchResultDto {
  id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  createdAt: Date;

  constructor(user: UserData) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.profilePicture = user.profilePicture;
    this.createdAt = user.createdAt;
  }
}
