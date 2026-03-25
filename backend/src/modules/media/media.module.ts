import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaService } from './media.service';
import { CloudinaryProvider } from '../config/cloudinary.provider';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, MediaService],
  exports: [MediaService],
  controllers: [],
})
export class MediaModule {}
