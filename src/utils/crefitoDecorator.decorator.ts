import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({async: false})
export class IsCrefitoValidConstraint implements ValidatorConstraintInterface{
    validate(value: string){
        return /^CREFITO-?\d+\s?\d+-?(F|TO)$/i.test(value)      
    }

    defaultMessage(args: ValidationArguments){
        return 'CREFITO inválido'
    }
}