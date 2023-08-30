import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { QuestionService } from './question.service';
import {
  PARAMS_ERROR,
  QUESTION_EXIST,
  QUESTION_NOT_FOUND,
} from 'src/constant/messageCode';
import { Question } from './schemas/question.schema';
import { isValidObjectId } from 'mongoose';
import { isBoolean } from 'lodash';
import { getCurrentTime } from 'src/utils/utils';

// interface ListParamsType {
//   isPublished?: boolean
//   isDeleted?: boolean
//   title?: string
//   isStar?: boolean
// }

@Controller('question')
export class QuestionController {
  constructor(private readonly QuestionService: QuestionService) {}

  @Post()
  /**
   * @description: 创建问卷
   * @param {*} Req
   * @return {*}
   */
  async createQuestion(@Req() request: Request) {
    const { body } = request;
    if (!body) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }

    const { createUser, title, componentList } = body;
    if (!title || !createUser || !componentList || !Array.isArray(componentList) || !isValidObjectId(createUser)) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    // 检查名称重复
    const created = await this.QuestionService.findQuestion({
      createUser,
      title,
    } as Question);
    if (created) {
      throw new BadRequestException({
        message: QUESTION_EXIST,
      });
    }
    return await this.QuestionService.create({ createUser, title, componentList } as Question);
  }

  @Patch('list')
  /**
   * @description: 批量编辑
   * @param {string} body.ids 问卷的_id数组
   * @return {*}
   */
  async updateQuestionBatch(@Body() body) {
    const { ids, isPublished, isDeleted, isStar } = body;
    if (!Array.isArray(ids) || !ids.length) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    for (const item of ids) {
      if (!isValidObjectId(item)) {
        ids.splice(
          ids.findIndex((i) => i === item),
          1,
        );
      }
    }
    const data = { updatedAt: getCurrentTime() } as Question;
    if (isPublished !== undefined && isBoolean(isPublished)) {
      data.isPublished = isPublished;
    }
    if (isStar !== undefined && isBoolean(isStar)) {
      data.isStar = isStar;
    }
    if (isDeleted !== undefined && isBoolean(isDeleted)) {
      data.isDeleted = isDeleted;
    }
    return await this.QuestionService.updateQuestionByIds(ids, data);
  }

  @Patch(':id')
  /**
   * @description: 编辑问卷 删除、标星、发布都是此接口
   * @param {string} body.id 问卷的_id
   * @return {*}
   */
  async patchQuestion(@Req() request, @Param() params) {
    const { body } = request;
    const { id } = params;
    const { title, isPublished, isStar, isDeleted, componentList, isAutoSave } = body;
    if (!isValidObjectId(id) || Object.keys(body).length < 1) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    const question = await this.QuestionService.findQuestionById(id);
    if (!question) {
      throw new BadRequestException({
        message: QUESTION_NOT_FOUND,
      });
    }
    const data: Partial<Question> = {
      title: title || question.title,
      updatedAt: getCurrentTime(),
    };
    if (isPublished !== undefined && isBoolean(isPublished)) {
      data.isPublished = isPublished;
    }
    if (isStar !== undefined && isBoolean(isStar)) {
      data.isStar = isStar;
    }
    if (isDeleted !== undefined && isBoolean(isDeleted)) {
      data.isDeleted = isDeleted;
    }
    if (isAutoSave !== undefined && isBoolean(isAutoSave)) {
      data.isAutoSave = isAutoSave;
    }
    if (Array.isArray(componentList) && componentList.length) {
      data.componentList = componentList;
    }
    return await this.QuestionService.updateQuestionById(id, data);
  }

  @Delete('list')
  /**
   * @description: 彻底删除问卷
   * @param {string} body.ids 问卷的_id数组
   * @return {*}
   */
  async deleteQuestionCompletely(@Req() request) {
    const { body } = request;
    const { ids } = body;
    if (!Array.isArray(ids) || !ids.length) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    for (const item of ids) {
      if (!isValidObjectId(item)) {
        ids.splice(
          ids.findIndex((i) => i === item),
          1,
        );
      }
    }
    return await this.QuestionService.deleteQuestionCompletely(ids);
  }

  @Get('detail/:id')
  /**
   * @description: 获取问卷详情
   * @param {string} Param.id 问卷id
   * @return {*}
   */
  async queryQuestion(@Param() params) {
    const { id } = params || {};
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    const question = await this.QuestionService.findQuestionById(id);
    if (!question) {
      throw new BadRequestException({
        message: QUESTION_NOT_FOUND,
      });
    }
    return question;
  }

  @Post('list')
  /**
   * @description: 获取问卷列表
   * @param {*} Body
   * @return {*}
   */
  async queryQuestionList(@Body() body) {
    const { pageSize, pageNumber, isStar, isDeleted, title, isPublished } =
      body || {};
    const limit = Number(pageSize);
    const skip = limit * (Number(pageNumber) - 1);
    if (!limit || isNaN(skip)) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    const filters: Object[] = [{ title: { $regex: title || '' } }];
    if (isStar !== undefined) {
      filters.push({ isStar });
    }
    if (isDeleted !== undefined) {
      filters.push({ isDeleted });
    }
    if (isPublished !== undefined) {
      filters.push({ isPublished });
    }
    return await this.QuestionService.queryQuestionList(
      { $and: filters },
      undefined,
      {
        skip,
        limit,
      },
    );
  }

  @Post('copy')
  /**
   * @description: 复制问卷
   * @param {*} Body
   * @return {*}
   */
  async copyQuestion(@Body() body) {
    const { id } = body;
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    const createdQuestion = await this.QuestionService.findQuestionById(id);
    if (!createdQuestion) {
      throw new BadRequestException({
        message: QUESTION_NOT_FOUND,
      });
    }
    const data = {
      ...createdQuestion,
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime(),
      title: createdQuestion.title + getCurrentTime(),
    };
    return await this.QuestionService.create(data);
  }
}
