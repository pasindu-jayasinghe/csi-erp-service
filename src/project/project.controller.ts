import { Body, Controller, Get, Param, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud, CrudController } from "@nestjsx/crud";
import { diskStorage } from "multer";
import { editFileName } from "src/utills/file-upload.utils";
import { Project } from "./entities/project.entity";
import { ProjectService } from "./project.service";

@Crud({
  model: {
    type: Project,
  },
  query: {
    join: {
      project_lead: {
        eager: true,
      },
      teamLeads: {
        eager: true,
      },
    },
  },
})

@Controller('project')
export class ProjectController implements CrudController<Project>{
  constructor(public service: ProjectService) { }

  get base(): CrudController<Project> {
    return this;
  }

  @Post('addProject')
  async createProject(@Body() projectDto: Project): Promise<Project> {
    return await this.service.create(projectDto);
  }

  @Post('upload-img/:pid')
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({ destination: './public', filename: editFileName }) }),)
  async uploadFileImg(@UploadedFile() file: Express.Multer.File, @Param('pid') pid,) {
    const newSavedfile = file.filename;
    return this.service.filePathSave(newSavedfile, pid);

  }

  @Get('getAllProjects')
  async getALlProjects(): Promise<Project[]> {
    return await this.service.getAllProjects();
  }

  @Get('getProjectById')
  async getProjectById(@Query("pid") pid: number): Promise<Project> {
    return await this.service.getProjectById(pid);
  }
  @Patch('updateProject')
  updateProject(@Param('id') id: number, @Body() projectDto: Project): Promise<Project> {
    return this.service.update(id, projectDto);
  }


  @Get('getAssignProjects')
  async getAssignProjects(
    @Query("aid") uId: number,
    @Query("userRole") userRole: string | null


  ): Promise<Project[]> {
  console.log(userRole)
    return await this.service.getAssignProjects(uId, userRole);
  }


  

  @Get('getProgress')
  async getAssignProjectProgress(
    @Query("pid") pId: number,

  ): Promise<any[]> {
    return await this.service.getProgress(pId);
  }


}


