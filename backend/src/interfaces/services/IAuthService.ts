import { User } from "../../models/User";
import { AuthTokens } from "../auth/tokens";

export interface IAuthService {
  registerUser(email: string, password: string, name?: string): Promise<User>;
  loginUser(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  logout(refreshToken: string): Promise<void>;
  refreshApiKey(userId: string): Promise<string>;
}
