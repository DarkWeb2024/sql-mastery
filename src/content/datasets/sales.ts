import type { Dataset } from '../../types';

// A regional sales time-series. Its shape (region, rep, month, amount) is ideal
// for window-function practice: ranking reps within a region, running totals over
// months, and month-over-month change with LAG. Amounts are kept distinct within
// each region so ranking questions have a single unambiguous answer.
export const salesDataset: Dataset = {
  id: 'sales',
  title: 'Regional sales',
  description:
    'Monthly sales by representative and region across four months. Used for window functions and analytics.',
  tables: ['sales'],
  seedSql: `
CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  region TEXT NOT NULL,
  rep TEXT NOT NULL,
  month TEXT NOT NULL,
  amount INTEGER NOT NULL
);

INSERT INTO sales (id, region, rep, month, amount) VALUES
  (1,  'North', 'Ava',   '2023-01', 12000),
  (2,  'North', 'Ava',   '2023-02', 15000),
  (3,  'North', 'Ava',   '2023-03', 14000),
  (4,  'North', 'Ava',   '2023-04', 18000),
  (5,  'North', 'Ben',   '2023-01', 9000),
  (6,  'North', 'Ben',   '2023-02', 11000),
  (7,  'North', 'Ben',   '2023-03', 13000),
  (8,  'North', 'Ben',   '2023-04', 12500),
  (9,  'South', 'Cara',  '2023-01', 20000),
  (10, 'South', 'Cara',  '2023-02', 17000),
  (11, 'South', 'Cara',  '2023-03', 22000),
  (12, 'South', 'Cara',  '2023-04', 21000),
  (13, 'South', 'Dan',   '2023-01', 8000),
  (14, 'South', 'Dan',   '2023-02', 9500),
  (15, 'South', 'Dan',   '2023-03', 10500),
  (16, 'South', 'Dan',   '2023-04', 16000),
  (17, 'East',  'Eve',   '2023-01', 14000),
  (18, 'East',  'Eve',   '2023-02', 13500),
  (19, 'East',  'Eve',   '2023-03', 15500),
  (20, 'East',  'Eve',   '2023-04', 17000),
  (21, 'East',  'Finn',  '2023-01', 7000),
  (22, 'East',  'Finn',  '2023-02', 8200),
  (23, 'East',  'Finn',  '2023-03', 9100),
  (24, 'East',  'Finn',  '2023-04', 9900),
  (25, 'West',  'Gita',  '2023-01', 25000),
  (26, 'West',  'Gita',  '2023-02', 24000),
  (27, 'West',  'Gita',  '2023-03', 26000),
  (28, 'West',  'Gita',  '2023-04', 30000),
  (29, 'West',  'Hugo',  '2023-01', 11000),
  (30, 'West',  'Hugo',  '2023-02', 12000),
  (31, 'West',  'Hugo',  '2023-03', 10000),
  (32, 'West',  'Hugo',  '2023-04', 13000);
`,
};
