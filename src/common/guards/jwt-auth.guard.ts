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
        const authHeader = request.headers.authorization

        if(!authHeader){
            throw new UnauthorizedException('Nenhum token fornecido. Usuário não autorizado')
        }

        const token = authHeader.split(' ')[1];
        try{
            //Verifica o token
            const decoded = this._jwtService.verify(token, {
                secret: this._configService.get<string>('JWT_SECRET_LOGIN')
            });
            //anexar os dados do usuário ao objeto request para usus posteriores
            request.user = {
                id: decoded.sub,
                email: decoded.email
            }
        return true;
        }catch(error){
            throw new UnauthorizedException('Token inválido ou expirou')
        }
    }
}