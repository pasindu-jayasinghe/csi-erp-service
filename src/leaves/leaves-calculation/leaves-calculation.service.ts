import { Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Gender, User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Leave } from '../entities/leave.entity';
import { LeaveTypes } from '../entities/leave_type.entity';
import { LeaveCalc } from './entities/leaves_calc.entity';

@Injectable()

export class LeavesCalculationService extends TypeOrmCrudService<User> {
    constructor(
        @InjectRepository(User) repo,
        @InjectRepository(LeaveCalc)
        public leaveCalcRepo: Repository<LeaveCalc>,
    ) {
        super(repo);
    }

    async calulateInitialLeavesPerYear(): Promise<any> {
        let users = await this.repo.find();
        for await (let user of users) {
            this.calculateInitialLeavesPerUser(user.id)
        }
    }

    async calculateInitialLeavesPerUser(userId:number):Promise<LeaveCalc>{
        console.log("passed user id to calcluate :", userId)
        const dateNow = new Date("2023/01/01"); // current date
        let user = await this.repo.findOne({ where: { id: userId } });
        let joinedDate = new Date(user.starting_date);
        console.log("joinedDate :", joinedDate,)
        let previousYr = dateNow.getFullYear() - 1
        let april1 = new Date(previousYr, 3, 2); // April 01
        let july1 = new Date(previousYr, 5, 2); // July 01
        let october1 = new Date(previousYr, 9, 2); // Oct 01

        //date differences
        let daysToApril1 = this.differenceof2Dates(dateNow, april1);
        let daysToJuly1 = this.differenceof2Dates(dateNow, july1);
        let daysToOctober1 = this.differenceof2Dates(dateNow, october1)
        // console.log("daysToApril1",daysToApril1,"daysToJuly1",daysToJuly1,"daysToOctober1",daysToOctober1)
        let C = 0; //casual leaves
        let A = 0; // annual leaves
        let S = 7; // sick leaves
        let ML = 0; // maternal leaves
        let L = 0; // Liue
        let SL = 0; // short leave
        let H = 0; // half day leave
        let N = 0;// No pay leave

        // To calculate the time difference of two dates
        let Difference_In_Time = dateNow.getTime() - joinedDate.getTime();
        // To calculate the no. of days between two dates
        let Difference_In_Days = Math.trunc(Difference_In_Time / (24 * 1000 * 3600));
        console.log("dateNow", dateNow, "joinedDate", joinedDate, "Difference_In_Days", Difference_In_Days)
        if (user.gender === Gender.Female) {
            ML = 84;
        }
        else {
            ML = 0;
        }

        if (joinedDate.getFullYear() === dateNow.getFullYear()) {
            C = 0;
            A = 0;
            console.log("C:", C, "A:", A, "S:", S)
        }
        else {
            if (Difference_In_Days > 365) {
                C = 7;
                A = 14;
                S = 7;
                N = 0;
            }
            else if (Difference_In_Days > daysToApril1 && Difference_In_Days <= 365) {
                
                C = 7;
                A = 14;
                S = 7;
                N = 0;

            }
            else if (Difference_In_Days > daysToJuly1 && Difference_In_Days <= daysToApril1) {
                
                C = 7;
                A = 10;
                S = 7;
                N = 0;
            }
            else if (Difference_In_Days > daysToOctober1 && Difference_In_Days <= daysToJuly1) {
                console.log("after ",Difference_In_Days) 
                C = 7;
                A = 7;
                S = 7;
                N = 0;
            }
            else if (Difference_In_Days <= daysToOctober1) {
             
                C = 7;
                A = 4;
                S = 7;
                N = 0;
            }
        }
        let existUser = await this.leaveCalcRepo.findOne({
            where: { user: { id: user.id },year:dateNow.getFullYear() },

        });
        if (!existUser) {
            let leaveCalc = new LeaveCalc();
            leaveCalc.annual_leaves = leaveCalc.rem_annual_leaves = A;
            leaveCalc.casual_leaves = leaveCalc.rem_casual_leaves = C;
            leaveCalc.sick_leaves = leaveCalc.rem_sick_leaves = S;
            leaveCalc.maternal_leaves = leaveCalc.rem_maternal_leaves = ML;
            leaveCalc.user = user;
            leaveCalc.year=dateNow.getFullYear();
            leaveCalc.no_pay_leaves = N;
            let  newUserDb = await this.leaveCalcRepo.save(leaveCalc);
            return newUserDb;
        }else{
            existUser.annual_leaves = existUser.rem_annual_leaves = A;
            existUser.casual_leaves = existUser.rem_casual_leaves = C;
            existUser.sick_leaves = existUser.rem_sick_leaves = S;
            existUser.maternal_leaves = existUser.rem_maternal_leaves = ML;
            existUser.user = user;
            existUser.year=dateNow.getFullYear();
            existUser.no_pay_leaves = N;
            let  newUserDb = await this.leaveCalcRepo.save(existUser);
            return newUserDb;

        }
        

        
    }
    async leaveReducing(leave:Leave){
        let userId=leave.request_by.id;
        let user = await this.repo.findOne({ where: { id: userId } });
        let existUser = await this.leaveCalcRepo.findOne({
            where: { user: { id: user.id }, year: new Date().getFullYear() },
        
        });
        let MDs = Number(leave.man_days);
        let newLeaveCalc; 
        if (!existUser) {
            newLeaveCalc =  this.calculateInitialLeavesPerUser(user.id);
            this.leaveReducing(leave);
        }
        else {
            if(leave.leave_type.name===LeaveTypes.CASUAL ){
                console.log(leave.leave_type.name)
                let updatedRemainingLeave = Number(existUser.rem_casual_leaves) - MDs;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                        
                    },
                    {
                        rem_casual_leaves: updatedRemainingLeave,
                       
                    });
                    console.log("updated user with" ,leave.leave_type.name,a)
            }
            else if(leave.leave_type.name==LeaveTypes.MEDICAL){
                let updatedRemainingLeave = Number(existUser.rem_sick_leaves) - MDs;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                    },
                    {
                        rem_sick_leaves: updatedRemainingLeave,
                        
                    });
                    console.log("updated user with" ,leave.leave_type.name,a)
            }
            else if(leave.leave_type.name==LeaveTypes.ANNUAL){
                let updatedRemainingLeave = Number(existUser.rem_annual_leaves) - MDs;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                    },
                   
                    {
                        rem_annual_leaves: updatedRemainingLeave,
                        
                    });
                    console.log(" updated user with" ,leave.leave_type.name ,a)
            }
            else if(leave.leave_type.name==LeaveTypes.SHORT_LEAVE){
                let updatedRemainingLeave = Number(existUser.rem_short_leaves) - 1;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                    },
                   
                    {
                        rem_short_leaves: updatedRemainingLeave,
                        
                    });
                    console.log(" updated user with" ,leave.leave_type.name ,a)
            }
            else if(leave.leave_type.name==LeaveTypes.NO_PAY_LEAVE){
                let updatedRemainingLeave = Number(existUser.no_pay_leaves) + leave.man_days;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                    },
                   
                    {
                        no_pay_leaves: updatedRemainingLeave,
                        
                    });
                    console.log(" updated user with" ,leave.leave_type.name ,a)
            }
            else if(leave.leave_type.name==LeaveTypes.NO_PAY_LEAVE_UNAUTHORIZED){
                let updatedRemainingLeave = Number(existUser.no_pay_unauthorized_leaves) + leave.man_days;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                    },
                   
                    {
                        no_pay_unauthorized_leaves: updatedRemainingLeave,
                        
                    });
                    console.log(" updated user with" ,leave.leave_type.name ,a)
            }
            else if(leave.leave_type.name==LeaveTypes.MATERNITY_LEAVE){
                let updatedRemainingLeave = Number(existUser.rem_maternal_leaves) - MDs;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                    },
                   
                    {
                        rem_maternal_leaves: updatedRemainingLeave,
                        
                    });
                    console.log(" updated user with" ,leave.leave_type.name ,a)
            }
            
            
            
        }
    }
    async leaveAdding(leave:any){

        let userId=leave.request_by.id;
        // let user = await this.repo.findOne({ where: { id: userId } });

        let existUser = await this.leaveCalcRepo.findOne({ 
            where: { user: { id: userId},year:new Date(leave.leave_starting_date).getFullYear() },
        
        });
        // console.log('user',userId,existUser);
        let MDs = Number(leave.man_days);
        let newLeaveCalc; 
       
            if(leave.leave_type.name===LeaveTypes.CASUAL ){
                console.log("MDs" ,MDs)
                let updatedRemainingLeave = Number(existUser.rem_casual_leaves) + MDs;
                console.log("updatedRemainingLeave" ,updatedRemainingLeave)
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: userId },
                        year: new Date().getFullYear()
                    },
                    {
                        rem_casual_leaves: updatedRemainingLeave,
                        editedOn:new Date(),
                       
                        
                    });
                    console.log("updated user with" ,leave.leave_type.name,a)
            }
            else if(leave.leave_type.name==LeaveTypes.MEDICAL){
                let updatedRemainingLeave = Number(existUser.rem_sick_leaves) + MDs;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: userId },
                        year: new Date().getFullYear()
                    },
                    {
                        rem_sick_leaves: updatedRemainingLeave,
                        
                    });
                    console.log("updated user with" ,leave.leave_type.name,a)
            }
            else if(leave.leave_type.name==LeaveTypes.ANNUAL){
                let updatedRemainingLeave = Number(existUser.rem_annual_leaves) + MDs;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: userId },
                        year: new Date().getFullYear()
                    },
                   
                    {
                        rem_annual_leaves: updatedRemainingLeave,
                        
                    });
                    console.log(" updated user with" ,leave.leave_type.name ,a)
            }
            else if(leave.leave_type.name==LeaveTypes.SHORT_LEAVE){
                let updatedRemainingLeave = Number(existUser.rem_short_leaves) + 1;
               
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: userId },
                        year: new Date().getFullYear()
                    },
                   
                    {
                        rem_short_leaves: updatedRemainingLeave,
                        
                    });
                    console.log(" updated user with" ,leave.leave_type.name ,a)
            }
            else if(leave.leave_type.name==LeaveTypes.NO_PAY_LEAVE){
                let updatedRemainingLeave = Number(existUser.no_pay_leaves) - MDs;
               
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: userId },
                        year: new Date().getFullYear()
                    },
                   
                    {
                        no_pay_leaves: updatedRemainingLeave,
                        
                    });
                    console.log(" updated user with" ,leave.leave_type.name ,a)
            }
            
            
       
    }
    async calculateShortLeaves(): Promise<any> {
        let users = await this.repo.find();
        for await (let user of users) {
            console.log("user.id",user.id)
            
            const dateNow = new Date(); // current date
            
            let joinedDate = new Date(user.starting_date);
            console.log(joinedDate)
            
            if (joinedDate.getFullYear() === dateNow.getFullYear()){
                let existUser = await this.leaveCalcRepo.findOne({ 
                    where: { user: { id: user.id},year:new Date().getFullYear() },
                
                });
                let updatedRemainingLeave = Number(existUser.rem_casual_leaves) ;
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                    },
                    {
                        rem_short_leaves: 2,
                        short_leaves:2,
                        rem_casual_leaves: updatedRemainingLeave + 0.5,
                        casual_leaves:updatedRemainingLeave + 0.5
                    });
              
                console.log("short leaves updated for user joined", joinedDate.getFullYear(), "(this year) with id",user.id)
                
            }
            else{
                var a = await this.leaveCalcRepo.update(
                    {
                        user: { id: user.id },
                        year: new Date().getFullYear()
                    },
                    {
                        rem_short_leaves: 2,
                        short_leaves:2,
                    });
                console.log("short leaves updated for user joined", joinedDate.getFullYear(), "(before this year) with id",user.id)
                 
            }

        }
    }
    differenceof2Dates(date1: Date, date2: Date): number {
        let Difference_In_Time = date1.getTime() - date2.getTime();

        // To calculate the no. of days between two dates
        let Difference_In_Days = Difference_In_Time / (24 * 1000 * 3600);
        return Difference_In_Days;
    }
}
