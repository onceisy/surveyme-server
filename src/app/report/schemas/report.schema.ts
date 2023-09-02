import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Question } from 'src/app/question/schemas/question.schema';
import { User } from 'src/app/user/schemas/user.schema';
import { getCurrentTime } from 'src/utils/utils';

export type questionDocument = HydratedDocument<QuestionAnswer>;

@Schema()
export class QuestionAnswer {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'question' })
  questionId: Question;

  @Prop({ default: () => getCurrentTime() })
  createdAt: number;

  @Prop({ required: true })
  creator: string;
  
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  os: string;
  
  @Prop({ default: () => ([]) })
  data: Array<{
    // 组件的_id
    _id: string;
    value: string;
    text: string | Array<string>,
  }>;
}

export const QuestionAnswerSchema = SchemaFactory.createForClass(QuestionAnswer);
