import { Option } from '../entities';
import { postgresqlDataSource } from '../clients';
import { UpdateResult } from 'typeorm';

export default postgresqlDataSource.getRepository(Option).extend({
  async getOption(id: string) {
    return await this.findOneBy({ id });
  },

  createOptions(options: Array<Omit<Option, 'id' | 'product'>>) {
    return this.create(options);
  },

  async removeOption(option: Option) {
    return await this.manager.transaction(async manager => await manager.remove(option));
  },

  async removeOptions(optionIds: string) {
    const { options, ...getOptionsResult } = (
      await Promise.allSettled(optionIds.split(',').map(async optionId => (await this.getOption(optionId)) || optionId))
    ).reduce<{
      options: Option[];
      doesNotExist: string[];
      failedFind: Array<string | Option>;
    }>(
      (acc, curr) => {
        const [target, value]: [keyof typeof acc, string | Option] =
          curr.status === 'rejected' ? ['failedFind', curr.reason] : [typeof curr.value === 'string' ? 'doesNotExist' : 'options', curr.value];

        return {
          ...acc,
          [target]: [...acc[target], value],
        };
      },
      {
        options: [],
        doesNotExist: [],
        failedFind: [],
      },
    );

    const removeOptionsResult = (await Promise.allSettled(options.map(async option => await this.removeOption(option)))).reduce<{
      removedOptions: Option[];
      failedRemove: Option[];
    }>(
      (acc, curr) => {
        const [target, value]: [keyof typeof acc, Option] = curr.status === 'rejected' ? ['failedRemove', curr.reason] : ['removedOptions', curr.value];

        return {
          ...acc,
          [target]: [...acc[target], value],
        };
      },
      {
        removedOptions: [],
        failedRemove: [],
      },
    );

    return {
      ...getOptionsResult,
      ...removeOptionsResult,
    };
  },

  async updateOption({ product, id, ...option }: Option) {
    return await this.manager.transaction(async manager => await manager.update(Option, { id }, option));
  },

  async updateOptions(options: Array<Option>) {
    return (await Promise.allSettled(options.map(async option => await this.updateOption(option)))).reduce<{
      updatedOptions: UpdateResult[];
      failedUpdate: UpdateResult[];
    }>(
      (acc, curr) => {
        const [target, value]: [keyof typeof acc, UpdateResult] = curr.status === 'rejected' ? ['failedUpdate', curr.reason] : ['updatedOptions', curr.value];

        return {
          ...acc,
          [target]: [...acc[target], value],
        };
      },
      { updatedOptions: [], failedUpdate: [] },
    );
  },

  async saveOptions<T>(options: T): Promise<T> {
    return await this.manager.transaction(async manager => await manager.save(options));
  },
});
