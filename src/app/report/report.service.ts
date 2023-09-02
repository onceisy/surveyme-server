import { Injectable } from '@nestjs/common';
import { QuestionAnswer } from './schemas/report.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionAnswerService {
  constructor(
    @InjectModel(QuestionAnswer.name) private questionAnswerModel: Model<QuestionAnswer>,
  ) {}

  async create(data: QuestionAnswer) {
    const created = new this.questionAnswerModel(data);
    return await created.save();
  }
  async queryAnswerList({ filters, projection = undefined, options }) {
    const count = await this.questionAnswerModel.count(filters);
    const list = await this.questionAnswerModel.find(filters, projection, options);
    return { count, list };
  }
}
