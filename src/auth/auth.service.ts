import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialDto } from './dto/auth.credential.dto';
import { group } from 'console';
import { Audit } from 'src/audit/entities/audit.entity';
import { AuditService } from 'src/audit/audit.service';
@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService
  ) {}
  
  async validateUser(username: string, pass: string): Promise<any> {
   
  }

  userAudit:any;
  async login(authCredentialDto: AuthCredentialDto): Promise<any> {
    console.log('AuthService.login',authCredentialDto);
    const { email, password } = authCredentialDto;
   
    const selectedUser = await this.usersService.findOne({where:{email:email}});
    if(selectedUser){
      this.userAudit = {

        description: selectedUser.first_name + " logged in",
        userName: selectedUser.first_name,
        actionStatus: "Logged in",
        userType: selectedUser.employee_types,
        uuId: selectedUser.id,

      }

    }
    else{
      this.userAudit = {

        description: authCredentialDto.email + " tried to log",
        userName: authCredentialDto.email,
        actionStatus: "Try to logging",
        userType: 'Unknown',
        uuId: 0,
      }

    }
    console.log(this.userAudit)
    this.auditService.create(this.userAudit)
    
  
    if (selectedUser && await selectedUser.validatePassword(password)) {
     
      // console.log("selectedUser",selectedUser)
      if (selectedUser.status === 1){
       
         
            const payload = {
              id:selectedUser.id,
              email: selectedUser.email,
              fname: selectedUser.first_name,
              lname: selectedUser.last_name,
              role:selectedUser.role.name,
              userType:selectedUser.employee_types,
              group:[...selectedUser.groupUser.map(a=>a.group.name)]
            };

           
    
    
            console.log('jwt payload ', payload);
            const expiresIn = '1h';
            let token = this.jwtService.sign(payload, { expiresIn });
            // console.log('token', token);

           
        
            return { access_token: token };
            
          
        
      } else {
        return {error: `User has been ${selectedUser.status==0?"deactivated":"deleted"} `};
      }
    } else {
      return {error: "Invalid credentials"};
    }
  }
  
}
