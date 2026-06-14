import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";


@Injectable()
export class UserInterceptor implements NestInterceptor{
    intercept(
        context: ExecutionContext, 
        next: CallHandler): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map((data) => {
                if(Array.isArray(data)){
                    return data.map(user => this.treatedResponseUser(user))
                }
                if(data?.updateProfile){
                    return{
                        ...data,
                        updateProfile: this.treatedResponseUser(data.updateProfile)
                    }
                }
                return this.treatedResponseUser(data);
            })
        )
    }


    private treatedResponseUser(user: any){
        const {
            password,
            resetToken,
            resetTokenExpiresAt,
            accountStatus, 
            ...rest
        } = user;

        return rest;
    }
}