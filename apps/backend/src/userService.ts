
import { User } from '@finance-tracker/shared';
import { UserRepository } from '../repositories/userRepository';

export class UserService {
  private static repo = new UserRepository();

  static async findByEmail(email: string): Promise<User | null> {
    const user = await this.repo.findByEmail(email);
    if (!user) return null;
    return {
      ...user,
      created_at: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
      updated_at: user.updated_at instanceof Date ? user.updated_at.toISOString() : user.updated_at,
      last_login: user.last_login instanceof Date ? user.last_login.toISOString() : user.last_login
    } as User;
  }

  static async findById(id: number): Promise<User | null> {
    const user = await this.repo.findById(id);
    if (!user) return null;
    return {
      ...user,
      created_at: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
      updated_at: user.updated_at instanceof Date ? user.updated_at.toISOString() : user.updated_at,
      last_login: user.last_login instanceof Date ? user.last_login.toISOString() : user.last_login
    } as User;
  }

  static async create(userData: {
    email: string;
    password_hash: string;
    name: string;
  }): Promise<User> {
    const user = await this.repo.createUser(userData);
    return {
      ...user,
      created_at: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
      updated_at: user.updated_at instanceof Date ? user.updated_at.toISOString() : user.updated_at,
      last_login: user.last_login instanceof Date ? user.last_login.toISOString() : user.last_login
    } as User;
  }

  static async updateProfile(id: number, profileData: {
    name?: string;
    profile_picture?: string;
    phone_number?: string;
    age_group?: string;
    bio?: string;
  }): Promise<User> {
    const user = await this.repo.updateUser(id, profileData);
    return {
      ...user,
      created_at: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
      updated_at: user.updated_at instanceof Date ? user.updated_at.toISOString() : user.updated_at,
      last_login: user.last_login instanceof Date ? user.last_login.toISOString() : user.last_login
    } as User;
  }

  static async updateLastLogin(id: number): Promise<void> {
    await this.repo.updateLastLogin(id);
  }

  static async deleteUser(id: number): Promise<void> {
    await this.repo.hardDelete(id);
  }
}
