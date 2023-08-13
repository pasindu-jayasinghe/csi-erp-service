import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmployeeTypes, Gender, User } from './entities/user.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import * as bcript from 'bcrypt';
import { Role } from './entities/role.entity';
import *as moment from 'moment';
import { GroupUser } from './entities/group-user.entity';
import { Not, Repository } from 'typeorm';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { Group } from './entities/group.entity';
const { v4: uuidv4 } = require('uuid');

@Injectable()
export class UserService extends TypeOrmCrudService<User> {

  constructor(@InjectRepository(User) repo,
    @InjectRepository(GroupUser)
    public groupUserRepo: Repository<GroupUser>,
  ) {
    super(repo);
  }
  async addUserManualy(createUserDto?: User): Promise<User> {

    let user = await this.repo.findOne({ where: { email: "admin@climatesi.com" } }
    );


    console.log(user);
    //To-do get country id from current context
    // let countryId = 1;
    // let country = await this.countryRepo.findOne(countryId);
    if (!user) {
      let newUser = new User();

      newUser.full_name = "Admin admin";
      newUser.first_name = "Admin";
      newUser.employee_id = "0000000000"
      newUser.employee_types = EmployeeTypes.INTERNAL
      newUser.starting_date = new Date();
      newUser.email = "admin@climatesi.com";
      newUser.BOD = new Date();
      newUser.status = 1;
      newUser.adress = "---------";
      newUser.EFP_number = "00000000";
      newUser.gender = Gender.Male;
      // newUser.spouse_name = createUserDto.country;
      newUser.NIC_number = '0000000000';

      newUser.salt = await bcript.genSalt();

      let newUUID = uuidv4();
      let newPassword = ('' + newUUID).substr(0, 6);
      // console.log(newPassword);

      newUser.password = await this.hashPassword(
        "admin",
        newUser.salt,
      );

      newUser.role = new Role(1);

      var newUserDb = await this.repo.save(newUser);
      newUserDb.password = '';
      newUserDb.salt = '';
      return newUserDb;
    }

    return user






  }



  private async hashPassword(password: string, salt: string): Promise<string> {
    return await bcript.hash(password, salt);
  }

  async validateUser(email: string, password: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { email: email } });

    console.log('user', user);

    if (user != undefined) {
      return (await user).validatePassword(password);
    }


  }

  async getAllUsers():Promise<User[]> {
  let res =   await this.repo.find({relations:['teamLeads'],where:{
    status:Not(RecordStatus.Deleted)
  }});
    return  res
  }


  async birthdayShowing() {
    let users = await this.repo.find({where:{
      status:Not(RecordStatus.Deleted)
    }});
    let birthdayUsers: User[] = [];

    for await (let user of users) {
      let dt1 = new Date(user.BOD)
      let dw = new Date().toISOString().slice(0, 10);
      let d2 = new Date(dw);
      let BOD = user.BOD.toString();
      let age =moment().diff(moment(BOD),'years')+1;
      let yearNow = d2.getFullYear();// this year
      let d3 = new Date(dt1.setFullYear(yearNow))
      var diff = d3.getTime() - d2.getTime();
      var daydiff = diff / (1000 * 60 * 60 * 24);
       //console.log(user.BOD,user.first_name,age,  "dt1", dt1, "d2", d2, "d3", d3, daydiff);
      if (daydiff > 0) {
        user.days_to_bday = daydiff;
        user.BOD = dt1;
        user.age = age;
        // console.log(user.first_name,user.days_to_bday)
        birthdayUsers.push(user);
        
      }

    }
    let recentBdays = birthdayUsers.sort((a, b) => (a.days_to_bday <= b.days_to_bday) ? -1 : 1)
    // recentBdays.find(({ days_to_bday, first_name }) => console.log(days_to_bday,first_name))
    let mostRecentBdays = recentBdays.slice(0,3)// most recent birthdays
    mostRecentBdays.find(({ days_to_bday, first_name }) => console.log("most recent birthdays",days_to_bday,first_name))
    return mostRecentBdays;

  }

  async getUserbyID(userId:number):Promise<User> {
    let res =   await this.repo.findOne({

      where: {
        id: userId,
      },

    })
      return  res
    }
  

  async create(user: User): Promise<User> {
    user.starting_date = new Date(user.starting_date);
    user.BOD = new Date(user.BOD);
    if (user.id) {
      user.editedOn = new Date();
      await this.groupUserRepo.delete({ user: { id: user.id } })
    } else {
      user.createdOn = new Date();
      user.salt = await bcript.genSalt();

      let newUUID = uuidv4();
      let newPassword = ('' + newUUID).substr(0, 6);
      user.password = await this.hashPassword(
        "admin",
        user.salt,
      );
    }
    const updateduser = await this.repo.save(user);

    for (let groupUser of user.groupUser) {
      groupUser.user.id = updateduser.id;
      await this.groupUserRepo.save(groupUser);

    }



    return updateduser;
  }

  async changePassword(user: User): Promise<User> {
    user.editedOn = new Date();

    const updateduser = await this.repo.save(user);

    return updateduser;
  }


  async deletUser(id:number):Promise<any>{

   return await  this.repo.update({id:id},{status:RecordStatus.Deleted})
  }

  async getTL(group:string):Promise<any>{
    console.log(group)
    let filter='group.name=:group and user.id in ( SELECT us1.id FROM erp.user as us1, erp.group as gr1 , erp.group_user as grus1 where us1.id=grus1.userId and gr1.id= grus1.groupId and gr1.name="TEAM_LEAD" )'
    let data = this.repo
    .createQueryBuilder('user')
    .leftJoinAndMapMany(
      'user.groupUser',
       GroupUser,
      'groupUser',
      'groupUser.userId = user.id',
    ).leftJoinAndMapOne(
      'groupUser.group',
       Group,
      'group',
      'groupUser.groupId = group.id',
    ).where(filter, { group })
    // console.log(await data.getQueryAndParameters())
    return await data.execute()
   }
   async getHOD():Promise<any[]>{
    console.log()
    let filter =`group.name='HOD'  `
    let data = this.repo
    .createQueryBuilder('user')
    .leftJoinAndMapMany(
      'user.groupUser',
       GroupUser,
      'groupUser',
      'groupUser.userId = user.id',
    ).leftJoinAndMapOne(
      'groupUser.group',
       Group,
      'group',
      'groupUser.groupId = groupUser.id',
    ).where(filter)
    // console.log(await data.getQueryAndParameters())
    return await data.execute()
   }
}
