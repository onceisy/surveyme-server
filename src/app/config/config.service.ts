import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Options } from './schemas/options.schema';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Options.name) private optionsModel: Model<Options>,
  ) {}

  async createOptions(options: Options) {
    const createdOptions = new this.optionsModel(options);
    return await createdOptions.save();
  }

  async findOptions(filter: Options) {
    return await this.optionsModel.findOne(filter).exec();
  }

  async findOptionsById(id: string) {
    return await this.optionsModel.findById(id);
  }

  async findOptionsByIds(ids: string[]) {
    return await this.optionsModel.find({
      _id: { $in: ids }
    });
  }
  async findOptionsByIdAndUpdate(id: string, data: Options) {
    return await this.optionsModel.findByIdAndUpdate(id, data);
  }

  async queryOptionsList(filters, projection, options) {
    const count = await this.optionsModel.count(filters);
    const list = await this.optionsModel.find(filters, projection, options).select({ options: 0 });
    return {
      list,
      count,
    };
  }
}
