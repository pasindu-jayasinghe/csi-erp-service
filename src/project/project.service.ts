import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import moment from 'moment';
import { Activity } from 'src/activities/entities/activity.entity';
import { getRepository, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { TeamLeads } from './entities/team_leads.entity';

@Injectable()
export class ProjectService extends TypeOrmCrudService<Project>{

  constructor(
    @InjectRepository(Project) repo,
    @InjectRepository(TeamLeads)
    public teasmLeadsRepo: Repository<TeamLeads>,

    @InjectRepository(Activity)
    public activity: Repository<Activity>,

  ) {
    super(repo);
  }

  async create(projectDto: Project): Promise<Project> {
    if (projectDto.id < 0) {
      projectDto.id = null
    }

    projectDto.start_date = new Date(projectDto.start_date)
    projectDto.end_date = new Date(projectDto.end_date)
    const project = await this.repo.save(projectDto);
    var x: number = 0
    projectDto.teamLeads.map((a) => {
      a.project.id = project.id
      a.lead.id = a.lead.id
      x++;

    })


    try {

      projectDto.teamLeads.map(async (a) => {
        let tl = await this.teasmLeadsRepo.save(a);
      });
    } catch (error) {
      console.log(error);
    }

    return project;
  }

  async update(id: number, projectDto: Project): Promise<Project> {

    projectDto.start_date = new Date(projectDto.start_date)
    projectDto.end_date = new Date(projectDto.end_date)

    const project = await this.repo.save(projectDto)

    var x: number = 0
    projectDto.teamLeads.map((a) => {
      a.project.id = projectDto.id
      a.lead.id = a.lead.id
      x++;
    });
    try {
      projectDto.teamLeads.map(async (a) => {
        let tl = await this.teasmLeadsRepo.save(a);
      });
    } catch (error) {
      console.log(error);
    }
    return project

  }

  async filePathSave(name: string, id: number) {

    let existingProject = await this.repo.findOne({
      where: { id: id },
    });
    existingProject.project_logo = "/" + name;

    return await this.repo.save(existingProject)

  }

  async getAllProjects(): Promise<Project[]> {

    // let filter: string = 'a.parentActivityId IS NULL AND a.status <> -20';

    // let data = await this.repo.createQueryBuilder('pa')
    //   .leftJoin('activity', 'a', 'a.projectId = pa.id')
    //   .select('pa.name ,pa.id, pa.client, pa.duration, a.planned_MD as planned_MD')
    //   // .addSelect('SUM(a.progress)/COUNT(a.progress)', 'progress')
    //   .addSelect('ROUND(SUM(a.progress)/COUNT(a.progress), 2)', 'progress')
    //   .addSelect('SUM(a.used_MD)', 'used_MD')
    //   .where(filter)
    //   .distinct()
    //   .groupBy("pa.id")

    let filter: string = 'a.parentActivityId IS NULL AND a.status <> -20';
    let data = await this.repo.createQueryBuilder('pa')
      .leftJoin('activity', 'a', 'a.projectId = pa.id AND ' + filter)
      .select('pa.name ,pa.id, pa.client, pa.duration')
      .addSelect('ROUND(SUM(a.progress)/COUNT(a.progress), 2)', 'progress')
      .addSelect('SUM(a.used_MD)', 'used_MD')
      .addSelect('SUM(a.planned_MD)', 'planned_MD')

      .distinct()
      .groupBy("pa.id")



    return data.execute()
  }



  async getProjectById(id: number): Promise<Project> {
    let res = this.repo.findOne({
      relations: ['teamLeads'],
      where: {
        id: id,
      },

    })

    return res
  }

  async getAssignProjects(userId: number, uRole: string): Promise<Project[]> {
    console.log("Uid-----", userId)
    let filter: string = 'a.parentActivityId IS NULL AND a.status <> -20';


    if (uRole !== "CEO") {
      if (userId != undefined && userId != null && userId > 0) {

        const subQuery = `SELECT projectId FROM activity where assignToId = :userId`
        let data = await this.repo
          .createQueryBuilder('pa')
          .innerJoin('activity', 'a', 'a.projectId = pa.id AND ' + filter)
          .leftJoinAndSelect('a.assign_to', 'assign_to', 'assign_to.id = a.assignToId')

          .leftJoin('pa.teamLeads', 'teamLeads')//TESTING
          .leftJoinAndSelect('teamLeads.lead', 'lead')//TESTING

          .select('pa.name ,pa.id, pa.client, pa.duration')
          .addSelect('ROUND(SUM(a.progress)/COUNT(a.progress), 2)', 'progress')
          .addSelect('SUM(a.used_MD)', 'used_MD')
          .addSelect('SUM(a.planned_MD)', 'planned_MD')

          .addSelect(`GROUP_CONCAT(DISTINCT CONCAT(teamLeads.leadId))`, 'teamLeadIds')//TESTING

          .where(`(a.projectId IN (${subQuery}))`, { userId: userId })
          .groupBy('pa.id')
          .distinct()



        return data.execute()

      }

    } else { return await this.getAllProjects() }

  }

  async getProgress(pId: number): Promise<any[]> {
    let data = await this.activity.createQueryBuilder('ac')
      .innerJoin(
        'ac.project',
        'project',
        'project.id = ac.projectId'
      )
      .addSelect('SUM(ac.progress)', 'pr')
      .where(`project.id = :pId`, { pId: 33 })
      .groupBy("ac.id")
    return data.execute()
  }

}