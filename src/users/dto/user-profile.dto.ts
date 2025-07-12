export class UserProfileDto {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  createdAt: Date;
  readCount: number;

  constructor(
    data: {
      id: string;
      name: string;
      email: string;
      profilePicture: string | null;
      createdAt: Date;
    },
    readCount: number,
  ) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.profilePicture = data.profilePicture;
    this.createdAt = data.createdAt;
    this.readCount = readCount;
  }
}
