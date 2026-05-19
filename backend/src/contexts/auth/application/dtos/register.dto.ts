import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'analyst@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'strongPassword123' })
    @IsString()
    @MinLength(8)
    password!: string;

    @ApiProperty({ example: 'John Analyst' })
    @IsString()
    @IsNotEmpty()
    name!: string;
}
