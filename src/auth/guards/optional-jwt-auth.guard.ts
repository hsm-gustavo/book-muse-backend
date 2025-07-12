import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    _err: unknown,
    user: JwtPayload | null,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    return (user ?? null) as TUser;
  }
}
