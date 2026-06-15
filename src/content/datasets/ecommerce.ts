import type { Dataset } from '../../types';

// A small revenue fact table for the e-commerce investigation mission. It is
// designed to tell a layered, deterministic story: total revenue falls 12% from
// May to June; the fall is concentrated entirely in the Electronics category;
// and within Electronics it is driven by returning (not new) customers, which
// points at a retention problem rather than a demand problem. Numbers are round
// so every investigation step has a single, checkable answer.
export const ecommerceDataset: Dataset = {
  id: 'ecommerce',
  title: 'E-commerce revenue',
  description:
    'Monthly revenue by category and customer type for an online retailer. Used for the revenue investigation mission.',
  tables: ['revenue_facts'],
  seedSql: `
CREATE TABLE revenue_facts (
  id INTEGER PRIMARY KEY,
  month TEXT NOT NULL,
  category TEXT NOT NULL,
  customer_type TEXT NOT NULL,
  revenue INTEGER NOT NULL
);

INSERT INTO revenue_facts (id, month, category, customer_type, revenue) VALUES
  (1,  '2023-05', 'Electronics', 'new',       15000),
  (2,  '2023-05', 'Electronics', 'returning', 25000),
  (3,  '2023-05', 'Apparel',     'new',       12000),
  (4,  '2023-05', 'Apparel',     'returning', 13000),
  (5,  '2023-05', 'Home',        'new',       9000),
  (6,  '2023-05', 'Home',        'returning', 11000),
  (7,  '2023-05', 'Books',       'new',       7000),
  (8,  '2023-05', 'Books',       'returning', 8000),
  (9,  '2023-06', 'Electronics', 'new',       14000),
  (10, '2023-06', 'Electronics', 'returning', 11000),
  (11, '2023-06', 'Apparel',     'new',       12500),
  (12, '2023-06', 'Apparel',     'returning', 13500),
  (13, '2023-06', 'Home',        'new',       9500),
  (14, '2023-06', 'Home',        'returning', 11500),
  (15, '2023-06', 'Books',       'new',       7500),
  (16, '2023-06', 'Books',       'returning', 8500);
`,
};
