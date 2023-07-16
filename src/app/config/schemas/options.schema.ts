import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getCurrentTime } from 'src/utils/utils';

export type optionsDocument = HydratedDocument<Options>;
class OptionType {
  label: string;
  children: OptionType[];
  _id: string;
}
@Schema()
export class Options {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  level: number;

  @Prop({ default: false })
  options: OptionType;

  @Prop({ default: () => getCurrentTime() })
  createdAt: number;

  @Prop({ default: () => getCurrentTime() })
  updatedAt: number;
}

export const OptionsSchema = SchemaFactory.createForClass(Options);
