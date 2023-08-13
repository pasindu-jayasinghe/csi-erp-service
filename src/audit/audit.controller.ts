import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { Repository } from 'typeorm';
import moment from 'moment';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    // @InjectRepository(Audit)
    // private readonly projectRepository: Repository<Audit>,
    ) {}

  @Post()
  create(@Body() createAuditDto: Audit) {
    console.log("createAuditDto", createAuditDto)
    return this.auditService.create(createAuditDto);
  }

  @Get(
    'audit/auditinfo/:page/:limit/:userType/:actionStatus/:logDate/:filterText/', 
  )
  async getAuditDetails(
    @Query('page') page: number,
    @Query('limit') limit: number,
     @Query('userType') user: string,
     @Query('actionStatus') actionStatus: string,
    @Query('logDate') logDate: string,
    @Query('filterText') filterText: string,
   
  ): Promise<any> {
  
   //let editedOnnew= moment(editedOn, "DD/MM/YYYY");
  //  console.log("hitttttttt : "+ logDate)
   var timestamp = Date.parse(logDate);
  var dateObject = new Date(timestamp);
  
  // console.log('jjjjjjfffff',moment(logDate,'MM-DD-YYYY').format('MM-DD-YYYY'));
  // console.log('hhh',logDate)
    return await this.auditService.getAuditDetails(
      {
        limit: limit,
        page: page,
      },
      filterText,
      user,
      actionStatus,
      logDate,
    );

  }

}
