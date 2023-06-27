import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/app/user/schemas/user.schema';
import { getCurrentTime } from 'src/utils/utils';

export type questionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop({ default: '' })
  title: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false })
  isStar: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: getCurrentTime() })
  createdAt: number;

  @Prop({ default: getCurrentTime() })
  updatedAt: number;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  createUser: User;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
