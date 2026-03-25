import { IsUUID, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({
    example: '78e75ef1-2003-445d-a266-bb127031bb44',
    description: 'ID de la categoría donde quedará el testimonio',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    example: 'correo@ejemplo.com',
    description: 'Email de la persona invitada a dejar el testimonio',
  })
  @IsEmail()
  @IsNotEmpty()
  invitedEmail: string;
}
