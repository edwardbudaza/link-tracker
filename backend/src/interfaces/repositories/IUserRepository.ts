import { User } from "../../models/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  updateById(id: string, updates: Partial<User>): Promise<User | null>;
}
