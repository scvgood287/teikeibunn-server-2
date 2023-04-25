import { Product } from '../entities';
import { postgresqlDataSource } from '../clients';
import { DeepPartial, UpdateResult } from 'typeorm';

export default postgresqlDataSource.getRepository(Product).extend({
  async getProducts(urlId: string) {
    return await this.find({ where: { urlId }, relations: { options: true }, order: { price: 'ASC', name: 'ASC', options: { name: 'ASC', price: 'ASC' } } });
  },

  async getProduct(id: string) {
    return await this.findOne({ where: { id }, relations: { options: true } });
  },

  createProducts(products: Array<DeepPartial<Product>>) {
    return this.create(products);
  },

  async removeProduct(product: Product) {
    return await this.manager.transaction(async manager => await manager.remove(product));
  },

  async removeProducts(productIds: string) {
    const { products, ...getProductsResult } = (
      await Promise.allSettled(productIds.split(',').map(async productId => (await this.getProduct(productId)) || productId))
    ).reduce<{
      products: Product[];
      doesNotExist: string[];
      failedFind: Array<string | Product>;
    }>(
      (acc, curr) => {
        const [target, value]: [keyof typeof acc, string | Product] =
          curr.status === 'rejected' ? ['failedFind', curr.reason] : [typeof curr.value === 'string' ? 'doesNotExist' : 'products', curr.value];

        return {
          ...acc,
          [target]: [...acc[target], value],
        };
      },
      {
        products: [],
        doesNotExist: [],
        failedFind: [],
      },
    );

    const removeProductsResult = (await Promise.allSettled(products.map(async product => await this.removeProduct(product)))).reduce<{
      removedProducts: Product[];
      failedRemove: Product[];
    }>(
      (acc, curr) => {
        const [target, value]: [keyof typeof acc, Product] = curr.status === 'rejected' ? ['failedRemove', curr.reason] : ['removedProducts', curr.value];

        return {
          ...acc,
          [target]: [...acc[target], value],
        };
      },
      {
        removedProducts: [],
        failedRemove: [],
      },
    );

    return {
      ...getProductsResult,
      ...removeProductsResult,
    };
  },

  async updateProduct({ options, id, urlId, ...product }: Product) {
    return await this.manager.transaction(async manager => await manager.update(Product, { id }, product));
  },

  async updateProducts(products: Array<Product>) {
    return (await Promise.allSettled(products.map(async product => await this.updateProduct(product)))).reduce<{
      updatedProducts: UpdateResult[];
      failedUpdate: UpdateResult[];
    }>(
      (acc, curr) => {
        const [target, value]: [keyof typeof acc, UpdateResult] = curr.status === 'rejected' ? ['failedUpdate', curr.reason] : ['updatedProducts', curr.value];

        return {
          ...acc,
          [target]: [...acc[target], value],
        };
      },
      {
        updatedProducts: [],
        failedUpdate: [],
      },
    );
  },

  async saveProducts<T>(products: T): Promise<T> {
    return await this.manager.transaction(async manager => await manager.save(products));
  },
});
