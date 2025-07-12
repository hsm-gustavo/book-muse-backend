export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.profilePicture = data.profilePicture;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
