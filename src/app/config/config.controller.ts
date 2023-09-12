import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ConfigService } from './config.service';
import { OPTIONS_EXIST, OPTIONS_NOT_FOUND, PARAMS_ERROR } from 'src/constant/messageCode';
import { Options } from './schemas/options.schema';
import { getCurrentTime } from 'src/utils/utils';
import { isValidObjectId } from 'mongoose';

@Controller('config')
export class ConfigController {
  constructor(private readonly ConfigService: ConfigService) {}

  @Post('options')
  async createOptions(@Body() body) {
    const { name, level } = body;
    if (!name || !level) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    // 检查名称重复
    const created = await this.ConfigService.findOptions({
      name,
    } as Options);
    if (created) {
      throw new BadRequestException({
        message: OPTIONS_EXIST,
      });
    }
    return await this.ConfigService.createOptions(body);
  }

  @Patch('options/:id')
  async updateOptions(@Body() body, @Param() params) {
    const { id } = params;
    const { level, name, options } = body;
    if (!id || !level || !name || !options || !options.length) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    const created = await this.ConfigService.findOptionsById(id);
    if (!created) {
      throw new BadRequestException({
        message: OPTIONS_NOT_FOUND,
      });
    }
    return await this.ConfigService.findOptionsByIdAndUpdate(id, { ...body, updatedAt: getCurrentTime() });
  }

  @Get('options/list')
  async queryOptionsList(@Query() query) {
    const { pageSize, pageNumber, name } = query
    const limit = Number(pageSize);
    const skip = limit * (Number(pageNumber) - 1);
    // if (!limit || isNaN(skip)) {
    //   throw new BadRequestException({
    //     message: PARAMS_ERROR,
    //   });
    // }
    const filters: Object[] = [{ name: { $regex: name || '' } }];
    return await this.ConfigService.queryOptionsList(
      { $and: filters },
      undefined,
      skip && limit ? {
        skip,
        limit,
      } : undefined,
    );

  }

  @Get('options/:id')
  async queryOptionsById (@Param() params) {
    const { id } = params;
    if (!id) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    return await this.ConfigService.findOptionsById(id);
  }

  /**
   * @description: 根据字典的_id，批量查询字典信息
   * @return {*}
   */  
  @Post('options/query')
  async QueryOptionByIds(@Body() body) {
    const { optionIds } = body;
    const validIds = []
    if (Array.isArray(optionIds)) {
      optionIds.forEach(o => {
        if (isValidObjectId(o)) validIds.push(o);
      })
    }
    if (!validIds.length) {
      throw new BadRequestException({
        message: PARAMS_ERROR,
      });
    }
    return await this.ConfigService.findOptionsByIds(validIds);
  }
}
