import type { Dataset } from '../../types';
import { companyDataset } from './company';
import { salesDataset } from './sales';
import { ecommerceDataset } from './ecommerce';

// Central registry of datasets. Questions and missions reference a dataset by id;
// adding a new dataset is just an entry here.
export const datasets: Record<string, Dataset> = {
  [companyDataset.id]: companyDataset,
  [salesDataset.id]: salesDataset,
  [ecommerceDataset.id]: ecommerceDataset,
};

export function getDataset(id: string): Dataset {
  const ds = datasets[id];
  if (!ds) throw new Error(`Unknown dataset: ${id}`);
  return ds;
}

export { companyDataset, salesDataset, ecommerceDataset };
