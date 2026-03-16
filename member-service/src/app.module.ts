import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from './members/members.module';
import { Member } from './members/member.entity';
import { Role } from './members/role.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'members_db',
      entities: [Member, Role],
      synchronize: true,
    }),
    MembersModule,
  ],
})
export class AppModule {}