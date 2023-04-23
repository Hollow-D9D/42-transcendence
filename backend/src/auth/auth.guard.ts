import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const jwtoken = request.headers['authorization'].split(' ')[1];
      if (jwtoken != 'undefined') {
        const payload = this.jwtService.verify(jwtoken, {
          secret: process.env.JWT_SECRET,
        });
        return this.cacheManager.get('logged_in').then((res: Array<string>) => {
          if (res && res.includes(<string>payload.login)) {
            return true;
          }
        });
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}
