import { FastifyRequest } from "fastify";
import { hash } from "bcryptjs";
import { UserRepository } from "./user.repository";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async create(data: {
    name: string;
    email: string;
    address: string;
    password: string;
    isSeller?: boolean;
  }) {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 8;
    const hashedPass = await hash(data.password, saltRounds);
    return this.userRepository.createUser({
      ...data,
      password: hashedPass,
      isSeller: data.isSeller || false,
    });
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }
    return user;
  }

  async update(id: string, data: Partial<{ name: string; email: string; address: string }>) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return this.userRepository.updateUser(id, data);
  }

  async delete(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return this.userRepository.deleteUser(id);
  }
}
