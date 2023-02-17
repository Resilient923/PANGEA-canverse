import { Filter, Repository } from 'src/common/types';
import { SaleItem } from './entities/saleitems.entity';

export interface SaleItemsRepo extends Repository<SaleItem> {
  find(filter?: Filter<SaleItem>): Promise<SaleItem>;

  findOneWithPopulate(filter: Filter<SaleItem>): Promise<SaleItem | null>;
}
