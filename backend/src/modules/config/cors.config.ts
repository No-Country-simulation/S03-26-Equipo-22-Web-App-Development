import { CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Request } from 'express';

export const buildCorsOptions = (
  allowedOrigins: string[],
): CorsOptionsDelegate<any> => {
  return (req: Request, callback) => {
    const origin = req.header('Origin');

    if (!origin) {
      return callback(null, { origin: true });
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, { origin: true });
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), { origin: false });
    }
  };
};
