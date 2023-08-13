import { Injectable } from '@nestjs/common';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Console } from 'console';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class AuditService extends TypeOrmCrudService<Audit> {
  constructor(
    @InjectRepository(Audit) repo) {
    super(repo);
  }
  async create(auditDto: Audit) {
    let date = new Date()

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    let y = `${year}-${month}-${day}`;

    auditDto.logTime = new Date().toLocaleTimeString();
    auditDto.logDate = y
    var newaudit = await this.repo.save(auditDto);
    console.log(newaudit)
    return newaudit
  }


  async getAuditDetails(
    options: IPaginationOptions,
    filterText: string,
    user : string,
    actionStatus: string,
    logDate: string,
  ): Promise<Pagination<Audit>> {
    let filter: string = '';
    // let fDate = `${editedOn.getFullYear()}-${editedOn.getMonth()+1}-${editedOn.getDate()}`;

    if (filterText != null && filterText != undefined && filterText != '') {
      filter =
        // '(dr.climateActionName LIKE :filterText OR dr.description LIKE :filterText)';
        '(dr.userName LIKE :filterText OR dr.actionStatus LIKE :filterText  OR dr.logDate LIKE :filterText OR dr.description LIKE :filterText  OR dr.userType LIKE :filterText )';
    }

  

    if (actionStatus != null && actionStatus != undefined && actionStatus != '') {
      if (filter) {
        filter = `${filter}  and dr.actionStatus= :actionStatus`;
      } else {
        filter = `dr.actionStatus = :actionStatus`;
      }
    }
    if (logDate != null && logDate != undefined && logDate != '') {
      if (filter) {
        filter =
          `${filter}  and(  dr.logDate LIKE :logDate)`;
      } else filter = '( dr.logDate LIKE :logDate)';
    }


    if (user != null && user != undefined && user != '') {

      if (filter) {
        filter = `${filter}  and dr.userName = :user`;
      } else {
        filter = `dr.userName = :user`;
      }
    }


   

    let data = this.repo
      .createQueryBuilder('dr')
 

      // .innerJoinAndMapOne('dr.country', Country, 'coun', 'dr.countryId = coun.id')

      .where(filter, {
        filterText: `%${filterText}%`,
        actionStatus,
        logDate: `%${logDate}%`,
        user,
        
      })
      .orderBy('dr.id', 'DESC');
    // console.log(
    //   '=====================================================================',
    // );
    // console.log(`dr.editedOn`);

    let result = await paginate(data, options);
    // console.log("rrrrrrr----",resualt.items[1].user.institution)

    if (result) {
      return result;
    }
  }

}
