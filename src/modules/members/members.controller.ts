import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserEntity } from '../../domain/entities/user.entity';
import type { MemberData } from '../../domain/repositories/member.repository.interface';
import { CreateMemberUseCase } from '../../application/use-cases/create-member.usecase';
import { DeleteMemberUseCase } from '../../application/use-cases/delete-member.usecase';
import { GetMemberUseCase } from '../../application/use-cases/get-member.usecase';
import { ListMembersUseCase } from '../../application/use-cases/list-members.usecase';
import { UpdateMemberUseCase } from '../../application/use-cases/update-member.usecase';
import { MemberDto } from './dtos/member.dto';
import { QueryMembersDto } from './dtos/query-members.dto';

@Controller('members')
@UseGuards(AuthGuard('jwt'))
@ApiTags('Members')
@ApiBearerAuth()
export class MembersController {
  constructor(
    private readonly createMemberUseCase: CreateMemberUseCase,
    private readonly deleteMemberUseCase: DeleteMemberUseCase,
    private readonly getMemberUseCase: GetMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
    private readonly updateMemberUseCase: UpdateMemberUseCase,
  ) {}

  @Get('me')
  async getCurrentMember(@CurrentUser() currentUser: UserEntity) {
    return {
      message: 'Member retrieved successfully',
      data: await this.getMemberUseCase.executeByEmail(currentUser.email),
    };
  }

  @Put('me')
  async upsertCurrentMember(
    @Body() memberDto: MemberDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const existing = await this.getMemberUseCase
      .executeByEmail(currentUser.email)
      .catch(() => null);
    const data = this.toMemberData(memberDto);
    const member = existing
      ? await this.updateMemberUseCase.execute(
          existing.id,
          currentUser.email,
          data,
        )
      : await this.createMemberUseCase.execute(currentUser.email, data);

    return { message: 'Member saved successfully', data: member };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async createMember(@Body() memberDto: MemberDto) {
    return {
      message: 'Member created successfully',
      data: await this.createMemberUseCase.execute(
        memberDto.email ?? null,
        this.toMemberData(memberDto),
      ),
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async listMembers(@Query() query: QueryMembersDto) {
    const result = await this.listMembersUseCase.execute(
      query.page,
      query.limit,
      query.search,
    );
    return {
      message: 'Members retrieved successfully',
      data: result.members,
      pagination: {
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getMember(@Param('id') id: string) {
    return {
      message: 'Member retrieved successfully',
      data: await this.getMemberUseCase.execute(id),
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateMember(@Param('id') id: string, @Body() memberDto: MemberDto) {
    return {
      message: 'Member updated successfully',
      data: await this.updateMemberUseCase.execute(
        id,
        memberDto.email ?? null,
        this.toMemberData(memberDto),
      ),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteMember(@Param('id') id: string): Promise<void> {
    await this.deleteMemberUseCase.execute(id);
  }

  private toMemberData(memberDto: MemberDto): MemberData {
    return {
      name: memberDto.name.trim(),
      phone: memberDto.phone.trim(),
      address: memberDto.address.trim(),
      city: memberDto.city.trim(),
      uf: memberDto.uf.trim().toUpperCase(),
      married: memberDto.married,
      churchMember: memberDto.churchMember,
      memberSince: new Date(`${memberDto.memberSince}T00:00:00.000Z`),
    };
  }
}
