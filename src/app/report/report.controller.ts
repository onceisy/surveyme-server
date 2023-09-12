import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { ConfigService } from '../config/config.service';

@Controller('report')
export class QuestionAnswerController {
  constructor(
    private readonly questionAnswerService: QuestionAnswerService,
    private readonly questionService: QuestionService,
    private readonly configService: ConfigService,
  ) { }

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
    return await this.questionAnswerService.create(params);
  }

  @Get('basicData/:id')
  /**
   * @description: 报表 - 原始数据
   * @param {*} Param
   * @return {*}
   */
  async getBasicData(@Param() params, @Query() query) {
    const { id } = params;
    const { pageNumber, pageSize } = query;
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
      total: count,
      list,
      question,
    }
    return response;
  }

  @Get('question/:id')
  /**
   * @description: 报表 - 原始数据
   * @param {*} Param
   * @return {*}
   */
  async getQuestionData(@Param() params) {
    const { id } = params;
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }

    const question = await this.questionService.findQuestionById(id);
    if (!question) {
      throw new BadRequestException({
        message: QUESTION_NOT_FOUND,
      });
    }
    // 获取所有需要用到的字典配置
    const { componentList } = question;
    const dicIds: string[] = [];
    componentList.forEach(c => {
      const { props } = c;
      const { isUseDic = false, dicId = '' } = props || {};
      if (isUseDic) {
        dicIds.push(dicId);
      }
    });
    const options = await this.configService.findOptionsByIds(dicIds);
    const data = await this.questionAnswerService.queryQuestionReport(id);

    const resList: {
      componentId: string;
      componentType?: string;
      name: string;
      data: {
        label: string; count: number;
      }[];
    }[] = componentList.map(c => {
      const { componentId, type: componentType, name, props = {}  } = c;
      return {
        componentId,
        componentType,
        name: name || props.label || props.text,
        data: [],
      };
    });

    data.forEach(answer => {
      const { data: answerData = [] } = answer;
      answerData.forEach(list => {
        // 答卷组件的详情
        const { componentId, label, value, componentType } = list;
        const componentInfo = componentList.find(c => c.componentId === componentId);
        if (componentInfo) {          
          const { props } = componentInfo;
          const { isUseDic = false, dicId = '', options: componentOptions } = props || {};
          let targetOptions = componentOptions;
          if (targetOptions) {
            // 多选、单选等
            if (isUseDic) {
              // 使用字典，重新查找options的值
              const dicOptions = options.find(o => o._id.toString() === dicId);
              if (dicOptions) {
                targetOptions = dicOptions.options;
              }
            }
            if (isArray(value)) {
              // 多选
              value.forEach(v => {
                const optionItem = targetOptions.find(o => o.key === v);
  
                const item = resList.find(l => l.componentId === componentId);
                const dataItem = item.data.find(d => d.label === optionItem.label);
                if (dataItem) {
                  dataItem.count += 1;
                } else {
                  item.data.push({
                    label: optionItem.label,
                    count: 1,
                  });
                }
              });
            } else {
              // 单选
              const optionItem = targetOptions.find(o => o.key === value);
              const item = resList.find(l => l.componentId === componentId);
              const dataItem = item.data.find(d => d.label === optionItem.label);
              if (dataItem) {
                dataItem.count += 1;
              } else {
                item.data.push({
                  label: optionItem.label,
                  count: 1,
                });
              }
            }
  
          } else {
            // 用户主动填写的类型
            const item = resList.find(l => l.componentId === componentId);
            const { data } = item;
            const dataItem = data.find(d => d.label === value);
            if (dataItem) {
              dataItem.count += 1;
            } else {
              data.push({
                label: value,
                count: 1,
              });
            }
          }
        }
      })
    });
    return {
      report: resList,
      question,
    };
  }

  @Post('queryUserAnswer')
  /**
   * @description: 查询访客是否提交过答卷
   * @param {*} Req
   * @return {*}
   */
  async queryUserAnswer(@Req() request: Request) {
    const { body } = request;
    if (!body) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }

    const { userId = '', questionId = '' } = body;
    if (!userId || !questionId) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }

    return await this.questionAnswerService.queryAnswerList({ filters: { questionId, creator: userId } })
  }
}