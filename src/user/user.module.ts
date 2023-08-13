import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Group } from './entities/group.entity';
import { GroupUser } from './entities/group-user.entity';
import { Child } from './entities/child.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
    User,Role,Group,GroupUser,Child
    ]), 
 
  ],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule {}
