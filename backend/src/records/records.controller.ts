import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() payload: CreateRecordDto) {
    return this.recordsService.create(user.sub, payload);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.recordsService.findAllByUser(user.sub);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() payload: UpdateRecordDto,
  ) {
    return this.recordsService.updateByUser(user.sub, id, payload);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.recordsService.removeByUser(user.sub, id);
  }
}
