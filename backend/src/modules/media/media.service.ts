import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import { Express } from 'express';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  /** Type Guard → evita errores `no-unsafe-member-access` */
  private isMulterFile(file: unknown): file is Express.Multer.File {
    return (
      typeof file === 'object' &&
      file !== null &&
      'buffer' in file &&
      Buffer.isBuffer((file as { buffer: unknown }).buffer)
    );
  }

  /** Upload desde Buffer → Cloudinary */
  async uploadBuffer(
    buffer: Buffer | ArrayBufferLike,
    options: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error: unknown, result: unknown) => {
          if (error instanceof Error) {
            this.logger.error('Cloudinary error buffer upload', error);
            return reject(new InternalServerErrorException(error.message));
          }
          if (!result)
            return reject(new InternalServerErrorException('Upload failed'));

          resolve(result as UploadApiResponse);
        },
      );

      const safeBuffer: Buffer = Buffer.isBuffer(buffer)
        ? buffer
        : Buffer.from(buffer);

      streamifier.createReadStream(safeBuffer).pipe(stream);
    });
  }

  /** Upload directo desde un archivo local */
  async uploadFile(
    path: string,
    options: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    try {
      return await cloudinary.uploader.upload(path, options);
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Unexpected upload error',
      );
    }
  }

  /** Destroy seguro por public_id */
  async delete(publicId: string): Promise<{ result: string }> {
    try {
      const res = (await cloudinary.uploader.destroy(publicId)) as {
        result: string;
      };
      return { result: res.result ?? 'ok' };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Unexpected delete error',
      );
    }
  }

  /** Upload de IMAGEN Multer con buffer (Testimonios) */
  async uploadImage(
    file: unknown,
    options: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    if (!this.isMulterFile(file)) {
      throw new BadRequestException('Archivo no válido — debe contener buffer');
    }

    const safeFile: Express.Multer.File = file;
    try {
      return await new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          options,
          (error: unknown, result: UploadApiResponse | undefined) => {
            if (error) {
              const msg =
                error instanceof Error ? error.message : 'Cloudinary error';
              return reject(new InternalServerErrorException(msg));
            }

            if (!result) {
              return reject(
                new InternalServerErrorException('No result from Cloudinary'),
              );
            }

            return resolve(result);
          },
        );

        upload.end(safeFile.buffer);
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error interno al subir imagen';
      throw new InternalServerErrorException(msg);
    }
  }
  saveVideoUrl(videoUrl: string) {
    if (!videoUrl) {
      throw new BadRequestException('Debe enviar una URL de video');
    }

    const isValidUrl = /^https?:\/\//i.test(videoUrl);
    if (!isValidUrl) {
      throw new BadRequestException('Formato de URL inválido');
    }

    return {
      url: videoUrl,
      mediaType: 'video',
      provider: this.detectVideoProvider(videoUrl), // opcional
    };
  }

  /** Detecta YouTube, Vimeo o Direct File (.mp4 / .webm / etc) */
  private detectVideoProvider(url: string): 'youtube' | 'vimeo' | 'direct' {
    if (url.includes('youtube.com') || url.includes('youtu.be'))
      return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'direct';
  }
}
