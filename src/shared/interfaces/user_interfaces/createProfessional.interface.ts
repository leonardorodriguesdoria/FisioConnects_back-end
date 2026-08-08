export interface ICreateProfessional {
    name:string;
    email:string;
    phone:string;
    password:string;
    city:string;
    profilePicture?:string;
    specialties: string[];
    description: string;
}