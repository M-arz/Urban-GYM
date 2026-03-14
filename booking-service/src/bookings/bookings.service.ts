import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './reserva.entity';

@Injectable()
export class BookingsService {

constructor(
@InjectRepository(Reserva)
private reservaRepository: Repository<Reserva>,
){}

create(data:any){
return this.reservaRepository.save(data);
}

findAll(){
return this.reservaRepository.find({
relations:['clase']
});
}

findOne(id:string){
return this.reservaRepository.findOne({
where:{id_reserva:id},
relations:['clase']
});
}

remove(id:string){
return this.reservaRepository.delete({id_reserva:id});
}

}