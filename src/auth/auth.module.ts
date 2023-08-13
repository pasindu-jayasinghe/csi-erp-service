import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { UserModule } from 'src/user/user.module';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuditService } from 'src/audit/audit.service';
import { AuditModule } from 'src/audit/audit.module';
import { Audit } from 'src/audit/entities/audit.entity';

@Module({
  imports: [
    PassportModule,
    UserModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '600s' },
    }),
    TypeOrmModule.forFeature([Audit]),
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy, ConfigService,AuditService],
  exports: [AuthService],
})
export class AuthModule {}
