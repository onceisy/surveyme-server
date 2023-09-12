import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Options, OptionsSchema } from './schemas/options.schema';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Options.name, schema: OptionsSchema },
    ]),
  ],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
