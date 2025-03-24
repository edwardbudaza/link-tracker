import { injectable, inject } from 'inversify';
import { TYPES } from '../di/types';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async createUser(email: string, password: string, name?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    return this.userRepository.updateById(userId, updates);
  }
} 