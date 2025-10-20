import { PrismaClient } from "../../generated/prisma";

export class ProductRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: {
      name?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.name) {
      where.name = { contains: filters.name };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findAllBySeller(sellerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    console.log(
      `[REPOSITORY] Buscando produtos - sellerId: ${sellerId}, skip: ${skip}, take: ${limit}`
    );

    const products = await this.prisma.product.findMany({
      where: { sellerId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    console.log(`[REPOSITORY] Encontrados ${products.length} produtos para o vendedor ${sellerId}`);

    return products;
  }

  async countBySeller(sellerId: string) {
    return this.prisma.product.count({
      where: { sellerId },
    });
  }

  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    images: string;
    stock: number;
    sellerId: string;
  }) {
    return this.prisma.product.create({
      data,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateProduct(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      images?: string;
      stock?: number;
    }
  ) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
