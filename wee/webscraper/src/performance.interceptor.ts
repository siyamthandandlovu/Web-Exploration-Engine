import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { performance } from 'perf_hooks';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = performance.now();
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `${context.getClass().name} - ${context.getHandler().name} executed in ${(
              performance.now() - now
            ).toFixed(2)}ms`,
          ),
        ),
      );
  }
}