import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserSearchQueryDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.repository.findOneBy({ id: signUpDto.id });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }

    const hashed = await this.hashPassword(signUpDto.password);
    const user = this.repository.create({ ...signUpDto, password: hashed });

    await this.repository.save(user);

    return signUpDto.id;
  }

  findAll(params: UserSearchQueryDto): Promise<User[]> {
    return this.repository.find({
      withDeleted: params.withDeleted,
      order: { id: 'ASC' },
    });
  }

  async findOne(id: string) {
    const existingUser = await this.repository.findOneBy({ id });

    if (!existingUser) {
      throw new NotFoundException('존재하지 않는 사용자 아이디 입니다.');
    }

    return existingUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.repository.findOneBy({ id });

    if (!existingUser) {
      throw new NotFoundException('존재하지 않는 사용자 아이디 입니다.');
    }

    const { password, ...body } = updateUserDto;

    if (password !== undefined) {
      existingUser.password = await this.hashPassword(password);
    }

    const merged = this.repository.merge(existingUser, body);

    await this.repository.save(merged);
  }

  async remove(id: string) {
    const result = await this.repository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException('존재하지 않는 사용자 입니다.');
    }
  }

  async restore(id: string): Promise<void> {
    const existingUser = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!existingUser) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    await this.repository.restore(id);
  }

  /* 비밀번호 관련 유틸함수 */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // 암호화 난이도 (강도)
    return await bcrypt.hash(password, saltRounds);
  }
}
