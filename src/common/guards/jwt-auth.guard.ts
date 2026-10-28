import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly _jwtService: JwtService,
        private readonly _configService: ConfigService,
        private readonly _dataSource: DataSource
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean>{
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

        let decoded: {sub?: string; email?: string; iat?: number};
        try{
            decoded = this._jwtService.verify(token, {
                secret: this._configService.getOrThrow<string>('JWT_SECRET_LOGIN')
            });
        }catch(error){
            throw new UnauthorizedException('Token inválido ou expirou')
        }

        const userId = Number(decoded.sub);

        if(!Number.isInteger(userId) || userId <= 0){
            throw new UnauthorizedException('Token Inválido')
        }

        const user = await this._dataSource.getRepository(User).findOne({
            where: {id: userId},
            select: {id: true, passwordChangedAt: true}
        });

        if(!user){
            throw new UnauthorizedException('Sessão inválida. Faça login novamente')
        }

        if(user.passwordChangedAt && (decoded.iat ?? 0) < Math.floor(user.passwordChangedAt.getTime() / 1000)){
            throw new UnauthorizedException('Sua senha foi alterada. Faça login novamente')
        }

        request.user = {
            id: userId,
            email: decoded.email
        }
        return true;
    }
}
