import { CartRepository } from "./cart.repository";

export class CartService {
  private cartRepository: CartRepository;

  constructor(cartRepository: CartRepository) {
    this.cartRepository = cartRepository;
  }

  async getCart(userId: string) {
    const items = await this.cartRepository.getCartItems(userId);

    return items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images ? item.product.images.split(";")[0] : undefined,
      stock: item.product.stock,
    }));
  }

  async addItem(userId: string, productId: string, quantity: number = 1) {
    const item = await this.cartRepository.addItem(userId, productId, quantity);

    return {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images ? item.product.images.split(";")[0] : undefined,
      stock: item.product.stock,
    };
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      await this.cartRepository.removeItem(userId, productId);
      return null;
    }

    const item = await this.cartRepository.updateQuantity(userId, productId, quantity);

    return {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images ? item.product.images.split(";")[0] : undefined,
      stock: item.product.stock,
    };
  }

  async removeItem(userId: string, productId: string) {
    await this.cartRepository.removeItem(userId, productId);
    return { message: "Item removido do carrinho" };
  }

  async clearCart(userId: string) {
    await this.cartRepository.clearCart(userId);
    return { message: "Carrinho limpo" };
  }
}
