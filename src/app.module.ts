import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './app/user/user.module';

@Module({
  imports: [AuthModule, MongooseModule.forRoot('mongodb://localhost:40008'), UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
