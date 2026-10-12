import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly _jwtService: JwtService,
        private readonly _configService: ConfigService
    ){}
    canActivate(context: ExecutionContext): boolean{
        const request = context.switchToHttp().getRequest();

        const cookieToken: string | undefined = request.cookies?.access_token;

        const authHeader: string | undefined = request.headers.authorization;

        const bearerToken =
            authHeader?.startsWith('Bearer ')
                ? authHeader.slice(7)
                : undefined;
        
        const token = cookieToken || bearerToken;

        if(!token){
            throw new UnauthorizedException('Token de autenticação não informado')
        }

        try{
            //Verifica o token
            const decoded = this._jwtService.verify(token, {
                secret: this._configService.getOrThrow<string>('JWT_SECRET_LOGIN')
            });

            const userId = Number(decoded.sub);

            if(!Number.isInteger(userId) || userId <= 0){
                throw new UnauthorizedException('Token Inválido')
            }

            //anexar os dados do usuário ao objeto request para usus posteriores
            request.user = {
                id: userId,
                email: decoded.email
            }
        return true;
        }catch(error){
            throw new UnauthorizedException('Token inválido ou expirou')
        }
    }
}