import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should validate a full valid dto', async () => {
    const dto = new CreateUserDto();
    dto.name = 'Example';
    dto.email = 'email@example.com';
    dto.password = '123456';
    dto.profilePicture = 'a picture';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid dto without a picture', async () => {
    const dto = new CreateUserDto();
    dto.name = 'Example';
    dto.email = 'email@example.com';
    dto.password = '123456';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if the email is invalid', async () => {
    const dto = new CreateUserDto();
    dto.name = 'Example';
    dto.email = 'emailexample.com';
    dto.password = '123456';
    dto.profilePicture = 'a picture';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if the password is too short', async () => {
    const dto = new CreateUserDto();
    dto.name = 'Example';
    dto.email = 'email@example.com';
    dto.password = '12345';
    dto.profilePicture = 'a picture';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail if the email is empty', async () => {
    const dto = new CreateUserDto();
    dto.name = 'Example';
    dto.email = '';
    dto.password = '123456';
    dto.profilePicture = 'a picture';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if the password is empty', async () => {
    const dto = new CreateUserDto();
    dto.name = 'Example';
    dto.email = 'email@example.com';
    dto.password = '';
    dto.profilePicture = 'a picture';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail if the name is empty', async () => {
    const dto = new CreateUserDto();
    dto.name = '';
    dto.email = 'email@example.com';
    dto.password = '123456';
    dto.profilePicture = 'a picture';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });
});
