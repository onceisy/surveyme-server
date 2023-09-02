import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionAnswer, QuestionAnswerSchema } from './schemas/report.schema';
import { QuestionAnswerController } from './report.controller';
import { QuestionAnswerService } from './report.service';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionAnswer.name, schema: QuestionAnswerSchema },
    ]),
    QuestionModule,
  ],
  controllers: [QuestionAnswerController],
  providers: [QuestionAnswerService],
})
export class QuestionAnswerModule {}
