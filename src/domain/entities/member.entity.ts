export interface MemberProps {
  id?: string;
  email?: string | null;
  name: string;
  phone: string;
  address: string;
  city: string;
  uf: string;
  married: boolean;
  churchMember: boolean;
  memberSince: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MemberEntity {
  id!: string;
  email: string | null;
  name: string;
  phone: string;
  address: string;
  city: string;
  uf: string;
  married: boolean;
  churchMember: boolean;
  memberSince: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: MemberProps) {
    if (!props.churchMember) {
      throw new Error('A member must have churchMember set to true');
    }

    this.id = props.id ?? '';
    this.email = props.email ?? null;
    this.name = props.name;
    this.phone = props.phone;
    this.address = props.address;
    this.city = props.city;
    this.uf = props.uf;
    this.married = props.married;
    this.churchMember = props.churchMember;
    this.memberSince = props.memberSince;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
