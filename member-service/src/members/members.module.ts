import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member } from './member.entity';
import { Role } from './role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, Role]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}