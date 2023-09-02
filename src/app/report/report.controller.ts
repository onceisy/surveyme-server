import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { QuestionAnswerService } from './report.service';
import {
  PARAMS_ERROR, QUESTION_NOT_FOUND,
} from 'src/constant/messageCode';
import { isValidObjectId } from 'mongoose';
import { isArray } from 'lodash';
import { QuestionService } from '../question/question.service';
import { QuestionAnswer } from './schemas/report.schema';
import { getCurrentTime } from 'src/utils/utils';

@Controller('report')
export class QuestionAnswerController {
  constructor(
    private readonly questionAnswerService: QuestionAnswerService,
    private readonly questionService: QuestionService,
  ) {}

  @Post()
  /**
   * @description: 用户端提交答卷
   * @param {*} Req
   * @return {*}
   */
  async createQuestion(@Req() request: Request) {
    const { body, ip } = request;
    if (!body) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }

    const { questionId, creator, os, data } = body;
    if (!questionId || !isValidObjectId(questionId) || !creator || !data || !isArray(data)) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }

    const question = await this.questionService.findQuestionById(questionId);
    if (!question) {
      throw new BadRequestException({
        message: QUESTION_NOT_FOUND,
      });
    }
    const params: QuestionAnswer = {
      questionId,
      creator,
      os,
      data,
      createdAt: getCurrentTime(),
      ip: ip,
    }
    return  await this.questionAnswerService.create(params);
  }

  @Get('basicData/:id')
  /**
   * @description: 报表 - 原始数据
   * @param {*} Param
   * @return {*}
   */
  async getBasicData(@Param() params) {
    const { id, pageNumber, pageSize } = params;
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    const limit = Number(pageSize);
    const skip = limit * (Number(pageNumber) - 1);

    const options: {
      limit?: number;
      skip?: number;
    } = {}
    if (limit) {
      options.limit = limit;
    }
    if (skip) {
      options.skip = skip;
    }

    const question = await this.questionService.findQuestionById(id);
    if (!question) {
      throw new BadRequestException({
        message: QUESTION_NOT_FOUND,
      });
    }
    const data = await this.questionAnswerService.queryAnswerList({
      filters: {
        questionId: id,
      },
      projection: undefined,
      options,
    });
    const { count, list } = data;
    const response = {
      questionId: question._id,
      questionTitle: question.title,
      total: count,
      list,
    }
    return response;
  }
}