import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService{
    constructor(private readonly configService: ConfigService){
        cloudinary.config({
            cloud_name: this.configService.getOrThrow<string>(
                'CLOUDINARY_CLOUD_NAME',
            ),
            api_key: this.configService.getOrThrow<string>(
                'CLOUDINARY_API_KEY',
            ),
            api_secret: this.configService.getOrThrow<string>(
                'CLOUDINARY_API_SECRET',
            ),
            secure: true,
        });
    }

    async uploadProfilePicture(file: Express.Multer.File){
        if(!file?.buffer?.length){
            throw new InternalServerErrorException('O arquivo da imagem não está disponível para upload.')
        }
        
        try{
            return await new Promise<{
                secureUrl: string;
                publicId: string;
            }>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'plus-physio/profile-pictures',
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    if (!result) {
                        reject(
                            new Error('O Cloudinary não retornou o resultado do upload.'),
                        );
                        return;
                    }

                    resolve({
                        secureUrl: result.secure_url,
                        publicId: result.public_id,
                    });
                },
            );

                uploadStream.end(file.buffer);
            });
        }catch{
            throw new InternalServerErrorException(
                'Não foi possível armazenar a imagem. Tente novamente mais tarde.',
            ); 
        }
    }
}