import { Injectable } from '@nestjs/common';
import { Question } from './schemas/question.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async create(question: Question) {
    const createdQuestion = new this.questionModel(question);
    return await createdQuestion.save();
  }

  async findQuestion(filter: Question) {
    return await this.questionModel.findOne(filter).exec();
  }

  async copyQuestionById(id) {
    return await this.questionModel.find(id).clone().exec();
  }

  async findQuestionById(id) {
    return await this.questionModel.findById(id);
  }

  async updateQuestionById(id, data) {
    return await this.questionModel.findByIdAndUpdate(id, data);
  }

  async updateQuestionByIds(ids, data) {
    return await this.questionModel.updateMany({ _id: { $in: ids } }, data);
  }

  async deleteQuestionCompletely(ids) {
    return await this.questionModel.deleteMany({ _id: { $in: ids } });
  }

  async queryQuestionList(filters, projection, options) {
    const count = await this.questionModel.count(filters);
    const list = await this.questionModel.find(filters, projection, options).select({ componentList: 0 });
    return {
      list,
      count,
    };
  }
}
