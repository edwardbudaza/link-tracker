import { injectable } from "inversify";
import UserModel, { User } from "../models/User";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";

@injectable()
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await UserModel.findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    return UserModel.findById(id);
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = new UserModel(user);
    return await newUser.save();
  }

  async updateById(id: string, updates: Partial<User>): Promise<User | null> {
    return await UserModel.findByIdAndUpdate(id, updates, { new: true });
  }
}
