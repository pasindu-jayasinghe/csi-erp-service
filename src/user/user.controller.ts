import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Crud } from '@nestjsx/crud';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from 'src/utills/file-upload.utils';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { query } from 'express';


// @Crud({
//   model: {
//     type: User,
//   },
//   query: {

//   },
// })
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(public userService: UserService,
    @InjectRepository(Group)
    public groupRepo: Repository<Group>,
    @InjectRepository(Role)
    public roleRepo: Repository<Role>) {

  }



  @Get('test')
  test(@Param('id') id: number): boolean {
    
    return true;
  }

  @Get('testTeamLead')
  testTL(@Query('group') group: string): any {
    this.userService.getTL("MRV_TEAM");
    // return this.userService.getHOD()

  }
  @Get('addUserManualy')
  async addUserManualy(): Promise<User> {
    return this.userService.addUserManualy();
  }

  @Post('addUser')
 
  async addUser(@Body() user: User): Promise<User> {
    console.log('user',user)
    return await this.userService.create(user);
  }
  @Post('addUserLogo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({ destination: './public/user', filename: editFileName }) }),)
  async addUserLogo(@UploadedFile() file: Express.Multer.File,): Promise<any> {
    const newSavedfile = file.filename;
    console.log(newSavedfile)
    return {filename:newSavedfile};
  }

  @Get('getUserById')
  async getUserById(@Query('id') userId:number): Promise<User> {

    return this.userService.findOne({where:{id:userId}});
  }
  @Get('all-users')
  async getALlUsers(): Promise<User[]>{
    return await this.userService.getAllUsers();
  }

  @Get('getAllGroups')
  async getAllGroups(): Promise<Group[]>{
    return await this.groupRepo.find();
  }

  @Get('getAllRoles')
  async getAllRoles(): Promise<Role[]>{
    return await this.roleRepo.find();
  }
  @Get('getNewPassword')
  async getNewPassword(@Query('userId') userId: number,  @Req() req: Request,): Promise<any>{
    console.log(userId);
   const user:User= await this.userService.findOne({where:{id:userId}});
   const newPassword:string=await user.changePassword()
   await this.userService.changePassword(user);
console.log(newPassword) 
    return {password:newPassword};
  }

  @Get('deletUser')
  async deletUser(@Query('userId') userId: number, ): Promise<any>{
    console.log(userId);
  //  const user:User= await this.userService.findOne({where:{id:userId}});

    return await this.userService.deletUser(userId);
  } 
  @Get('getBirthdays')
  async getBirthdays(): Promise<any>{
    return await this.userService.birthdayShowing();
  }
  @Get('getTL')
  async getTL(@Query('group') group: string,): Promise<any>{
    return await this.userService.getTL(group); 
  }


}
