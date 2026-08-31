import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './config/data-source';
import { ProjectModule } from './project/project.module';
import { ProjectMemberModule } from './project-member/project-member.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}`,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    UserModule,
    ProjectModule,
    ProjectMemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
