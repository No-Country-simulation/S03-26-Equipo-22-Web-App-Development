import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './modules/database/database.module';
import { EnvConfiguration } from './modules/config/env.config';
import { envValidationSchema } from './modules/config/env.validation';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { MediaModule } from './modules/media/media.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EmbedModule } from './modules/embed/embed.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfiguration],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Schedule Module (para tareas cron)
    ScheduleModule.forRoot(),

    // Database Module
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    EmailModule,
    TestimonialsModule,
    CategoriesModule,
    TagsModule,
    MediaModule,
    ModerationModule,
    AnalyticsModule,
    EmbedModule,
  ],
})
export class AppModule {}
