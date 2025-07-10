import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from 'src/env/env.service';

type JwtPayload = {
  sub: string;
  email: string;
};

/**
 * A estratégia usada para autenticar o usuário
 * Usada pelos guards para validar a requisição
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly envService: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // como o token vai ser extraido
      // e o resto é como ele é validado
      ignoreExpiration: false,
      secretOrKey: envService.get('JWT_SECRET'),
      audience: envService.get('JWT_TOKEN_AUDIENCE'),
      issuer: envService.get('JWT_TOKEN_ISSUER'),
    });
  }

  validate(payload: JwtPayload) {
    // aqui é a chave user da requisiçao
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
