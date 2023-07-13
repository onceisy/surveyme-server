import { BadRequestException, Controller, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { PASSWORD_REGEXP, USERNAME_REGEXP } from 'src/utils/regexp';
import { formatUserInfo } from 'src/utils/utils';
import {
  PARAMS_ERROR,
  PASSWORD_ERROR,
  USER_EXIST,
  USER_NOT_FOUND,
} from 'src/constant/messageCode';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  /**
   * @description: 用户注册
   * @return {*}
   */
  @Post('register')
  async register(@Req() request: Request) {
    const { body } = request;
    const params = {
      ...body,
      username: (body.username as string) || '',
      nickname: (body.username as string) || '',
      password: (body.password as string) || '',
    };
    if (
      !USERNAME_REGEXP.test(params.username) ||
      !PASSWORD_REGEXP.test(params.password)
    ) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    const user = await this.UserService.findUserByUsername(params.username);
    if (user) {
      throw new BadRequestException({
        message: USER_EXIST,
      });
    } else {
      const data = await this.UserService.register(params);
      return formatUserInfo(data);
    }
  }

  /**
   * @description: 登陆
   * @return {*}
   */
  @Post('login')
  async login(@Req() request: Request) {
    const { body } = request;

    const filters = {
      username: (body.username as string) || '',
      password: (body.password as string) || '',
    };
    if (
      !USERNAME_REGEXP.test(filters.username) ||
      !PASSWORD_REGEXP.test(filters.password)
    ) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    const user = await this.UserService.findUserByUsername(filters.username);
    if (!user) {
      throw new BadRequestException({
        message: USER_NOT_FOUND,
      });
    } else {
      if (user.password !== body.password) {
        throw new BadRequestException({
          message: PASSWORD_ERROR,
        });
      } else {
        return formatUserInfo(user);
      }
    }
  }
}
