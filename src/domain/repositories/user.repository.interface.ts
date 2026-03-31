export interface IUserRepository {
  save(email: string, passwordHash: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  findById(id: string): Promise<any>;
}
