import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm/lib/typeorm-crud.service";
import { IPaginationOptions, paginate, Pagination } from "nestjs-typeorm-paginate";
import { GeneralTask } from "./entities/general_task.entity";


@Injectable()
export class GeneralTaskService extends TypeOrmCrudService<GeneralTask> {

  constructor(
    @InjectRepository(GeneralTask) repo,
  ) {
    super(repo);
  }



  async create(gTaskDto: GeneralTask): Promise<GeneralTask> {
      gTaskDto.date = new Date(gTaskDto.date)
    const gTask = await this.repo.save(gTaskDto);
    return gTask
  }


  async getGTasks(
    options: IPaginationOptions,
    date: Date,
    userId: number,
    hasDate: string

  ): Promise<Pagination<GeneralTask>> {

    let filter: string = '';
    let datestr = date.toLocaleString().substring(0, 10);

    if (userId != undefined && userId > 0) {
      if (filter) {
        filter = `${filter}  and user.id = :userId`;
      } else {
        filter = `user.id = :userId`;
      }
    }
    if (hasDate === "true") {

      if (filter) {
        filter = `${filter}  and gt.date = :datestr`;
      } else {
        filter = `gt.date = :datestr`;
      }
    }

    let data = await this.repo.createQueryBuilder('gt')
    .leftJoinAndSelect(
      'gt.user',
      'user',
      'user.id = gt.user'
    ).where(filter, { userId, datestr })

    let resualt = await paginate(data, options);


    return resualt
  }

  
  async getgTaskById(id: number): Promise<GeneralTask> {
    let res = this.repo.findOne({

      where: {
        id: id,
      },

    })

    return res
  }


  async updateFeedBack(id: number, csiFeedBack: string): Promise<GeneralTask> {

    const updateGtask = await this.repo.update(
      { id: id },
      { csiFeedBack: csiFeedBack},
    );

    return updateGtask[0]

  }

}