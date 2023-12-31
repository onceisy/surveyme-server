import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  nickname?: string;

  @Prop()
  avatar?: string;

  @Prop()
  phoneNumber?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
