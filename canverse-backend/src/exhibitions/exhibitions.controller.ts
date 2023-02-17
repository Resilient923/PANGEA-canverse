import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReqUser } from 'src/common/decorator';
import { User } from 'src/users/entities/user.entity';
import { OptionalJwtGuard } from 'src/users/optional.jwt.guard';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import {
  ExhibitionFilterDto,
  ExhibitionTypeFilterDto,
} from './dto/exhibitions.dto';
import { ExhibitionsService } from './exhibitions.service';

@Controller('exhibitions')
@ApiTags('Exhibitions')
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @ApiOperation({ summary: 'Filter exhibitions' })
  @Get('filter')
  async filter(@Query() params: ExhibitionFilterDto) {
    return this.exhibitionsService.filterSaleItems(params);
  }

  // main에 보여줄 active 전시를 가져오기 위해서 get active exhibition 으로 변경 했습니다.
  @ApiOperation({ summary: 'Get active exhibition' })
  @Get('active')
  @ApiBearerAuth('jwt')
  @UseGuards(OptionalJwtGuard)
  async findOne(@ReqUser() user: User | null) {
    return this.exhibitionsService.findActiveExhibition(user);
  }

  @ApiOperation({ summary: 'Get exhibition by ExhibitionType' })
  @Get('show_exhibitions')
  async filterByType(@Query() params: ExhibitionTypeFilterDto) {
    return this.exhibitionsService.filterByType(params);
  }
  // @ApiOperation({ summary: 'Create exhibition' })
  // @Post()
  // async createExhibition(@Body() params: CreateExhibitionDto) {
  //   await this.ExhibitionsService.createExhibition();
  // }

  // @ApiOperation({ summary: 'Update exhibition' })
  // @Patch(':id')
  // async updateExhibition(@Body() params: UpdateExhibitionDto) {
  //   await this.ExhibitionsService.updateExhibition();
  // }
}
