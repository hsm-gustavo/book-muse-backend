import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class ExecutionTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const end = Date.now();
        const executionTime = end - start;
        console.log(`Execution time: ${executionTime}ms`);
      }),
    );
  }
}
