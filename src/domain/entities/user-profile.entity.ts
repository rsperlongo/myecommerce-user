export interface UserProfileProps {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  uf: string;
  married: boolean;
  churchMember: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserProfileEntity {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  uf: string;
  married: boolean;
  churchMember: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: UserProfileProps) {
    this.email = props.email;
    this.name = props.name;
    this.phone = props.phone;
    this.address = props.address;
    this.city = props.city;
    this.uf = props.uf;
    this.married = props.married;
    this.churchMember = props.churchMember;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
