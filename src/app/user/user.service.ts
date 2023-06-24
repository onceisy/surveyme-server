import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(user: User) {
    const createdUser = new this.userModel(user);
    return await createdUser.save();
  }

  async findUserByUsername(username) {
    return await this.userModel.findOne({username}).exec();
  }
}
