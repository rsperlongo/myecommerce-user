import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { MemberEntity } from '../../domain/entities/member.entity';
import type { IMemberRepository } from '../../domain/repositories/member.repository.interface';
import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { UpsertUserProfileUseCase } from './upsert-user-profile.usecase';

describe('UpsertUserProfileUseCase', () => {
  it('normalizes text fields before saving the profile', async () => {
    const saveMock = jest.fn().mockResolvedValue(
      new UserProfileEntity({
        email: 'user@example.com',
        name: 'Maria da Silva',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123',
        city: 'Sao Paulo',
        uf: 'SP',
        married: false,
        churchMember: true,
      }),
    );
    const repository: jest.Mocked<IUserProfileRepository> = {
      findByEmail: jest.fn(),
      save: saveMock,
    };
    const memberRepository: jest.Mocked<IMemberRepository> = {
      findByEmail: jest.fn().mockResolvedValue(
        new MemberEntity({
          email: 'user@example.com',
          name: 'Maria da Silva',
          phone: '(11) 99999-9999',
          address: 'Rua das Flores, 123',
          city: 'Sao Paulo',
          uf: 'SP',
          married: false,
          churchMember: true,
          memberSince: new Date('2010-09-05'),
        }),
      ),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const useCase = new UpsertUserProfileUseCase(repository, memberRepository);

    await useCase.execute('user@example.com', {
      name: ' Maria da Silva ',
      phone: ' (11) 99999-9999 ',
      address: ' Rua das Flores, 123 ',
      city: ' Sao Paulo ',
      uf: ' sp ',
      married: false,
      churchMember: true,
    });

    expect(saveMock).toHaveBeenCalledWith('user@example.com', {
      name: 'Maria da Silva',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123',
      city: 'Sao Paulo',
      uf: 'SP',
      married: false,
      churchMember: true,
    });
  });
});
