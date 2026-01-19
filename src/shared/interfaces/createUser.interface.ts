/* eslint-disable prettier/prettier */
export interface ICreateUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  description: string;
  profilePicture?: string;
  crefito: string;
  specialties: string[];
}