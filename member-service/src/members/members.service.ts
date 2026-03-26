import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('members')
      .from('members')
      .select('id, name, email, phone, subscription_plan, subscription_status, created_at, roles(name)');

    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('members')
      .from('members')
      .select('id, name, email, phone, subscription_plan, subscription_status, created_at, roles(name)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Socio no encontrado');
    return data;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('members')
      .from('members')
      .update({ ...updateMemberDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, email, phone, subscription_plan, subscription_status')
      .single();

    if (error || !data) throw new NotFoundException('Socio no encontrado');
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('members')
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException('Socio no encontrado');
    return { message: 'Socio eliminado correctamente' };
  }
}
