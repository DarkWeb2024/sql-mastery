import type { Dataset } from '../../types';
import { companyDataset } from './company';
import { salesDataset } from './sales';

// Central registry of datasets. Questions reference a dataset by id; adding a new
// dataset is just an entry here.
export const datasets: Record<string, Dataset> = {
  [companyDataset.id]: companyDataset,
  [salesDataset.id]: salesDataset,
};

export function getDataset(id: string): Dataset {
  const ds = datasets[id];
  if (!ds) throw new Error(`Unknown dataset: ${id}`);
  return ds;
}

export { companyDataset, salesDataset };
