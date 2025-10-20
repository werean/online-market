import { hash } from "bcryptjs";
import { SellerRepository } from "./seller.repository";

export class SellerService {
  private sellerRepository: SellerRepository;

  constructor(sellerRepository: SellerRepository) {
    this.sellerRepository = sellerRepository;
  }

  async create(data: { name: string; email: string; address: string; password: string }) {
    // Check if email already exists
    const existingSeller = await this.sellerRepository.findByEmail(data.email);
    if (existingSeller) {
      throw new Error("E-mail já cadastrado.");
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10);

    return this.sellerRepository.createSeller({
      ...data,
      password: hashedPassword,
    });
  }

  async getAll() {
    return this.sellerRepository.findAll();
  }

  async getOne(id: string) {
    const seller = await this.sellerRepository.findById(id);
    if (!seller) {
      throw new Error("Vendedor não encontrado.");
    }
    return seller;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      address: string;
    }>
  ) {
    const seller = await this.sellerRepository.findById(id);
    if (!seller) {
      throw new Error("Vendedor não encontrado.");
    }

    // Check if new email already exists
    if (data.email && data.email !== seller.email) {
      const existingSeller = await this.sellerRepository.findByEmail(data.email);
      if (existingSeller) {
        throw new Error("E-mail já cadastrado.");
      }
    }

    return this.sellerRepository.updateSeller(id, data);
  }
}
