import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Literalmente um guarda
 * Extrai o token do header authorization
 * valida a assinatura e a data de expiração
 * Se for valido, decodifica o token e adiciona uma chave user na request
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
