import type { Dataset } from '../../types';

// A single, coherent company dataset. Keeping every Phase 1 question on one
// schema means learners build a mental model of the tables instead of relearning
// a new schema per question. The data is small enough to reason about by hand
// but rich enough for joins, grouping, and aggregation.
export const companyDataset: Dataset = {
  id: 'company',
  title: 'Company operations',
  description:
    'Employees and departments alongside customers, products, and their orders. Used across the basics, filtering, aggregation, and join topics.',
  tables: ['departments', 'employees', 'customers', 'products', 'orders', 'order_items'],
  seedSql: `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  salary INTEGER NOT NULL,
  hire_date TEXT NOT NULL,
  manager_id INTEGER REFERENCES employees(id)
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  signup_date TEXT NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL
);

INSERT INTO departments (id, name, location) VALUES
  (1, 'Engineering', 'San Francisco'),
  (2, 'Sales', 'New York'),
  (3, 'Marketing', 'New York'),
  (4, 'Support', 'Austin');

INSERT INTO employees (id, name, department_id, salary, hire_date, manager_id) VALUES
  (1, 'Alice Johnson', 1, 145000, '2018-03-12', NULL),
  (2, 'Bob Smith', 1, 120000, '2019-07-01', 1),
  (3, 'Carol Lee', 1, 98000, '2021-02-15', 1),
  (4, 'David Kim', 2, 85000, '2020-05-20', 7),
  (5, 'Eva Brown', 2, 92000, '2019-11-03', 7),
  (6, 'Frank Moore', 3, 70000, '2022-01-10', 9),
  (7, 'Grace Davis', 2, 130000, '2017-06-25', NULL),
  (8, 'Henry Wilson', 4, 60000, '2023-03-01', NULL),
  (9, 'Irene Clark', 3, 110000, '2018-09-14', NULL),
  (10, 'Jack Taylor', 1, 105000, '2020-08-19', 1);

INSERT INTO customers (id, name, city, country, signup_date) VALUES
  (1, 'Acme Corp', 'New York', 'USA', '2021-01-15'),
  (2, 'Globex', 'London', 'UK', '2021-03-22'),
  (3, 'Initech', 'Toronto', 'Canada', '2022-06-30'),
  (4, 'Umbrella', 'New York', 'USA', '2020-11-05'),
  (5, 'Soylent', 'Berlin', 'Germany', '2023-02-12'),
  (6, 'Hooli', 'San Francisco', 'USA', '2022-09-01'),
  (7, 'Vandelay Industries', 'Chicago', 'USA', '2023-05-01');

INSERT INTO products (id, name, category, price) VALUES
  (1, 'Standard License', 'Software', 199.00),
  (2, 'Pro License', 'Software', 499.00),
  (3, 'Enterprise License', 'Software', 1999.00),
  (4, 'Onboarding', 'Service', 750.00),
  (5, 'Support Plan', 'Service', 300.00),
  (6, 'Training Workshop', 'Service', 1200.00);

INSERT INTO orders (id, customer_id, order_date, status) VALUES
  (1, 1, '2023-01-10', 'completed'),
  (2, 1, '2023-02-15', 'completed'),
  (3, 2, '2023-02-20', 'completed'),
  (4, 3, '2023-03-05', 'pending'),
  (5, 4, '2023-03-12', 'completed'),
  (6, 2, '2023-04-01', 'cancelled'),
  (7, 5, '2023-04-18', 'completed'),
  (8, 1, '2023-05-22', 'pending'),
  (9, 6, '2023-05-30', 'completed'),
  (10, 4, '2023-06-11', 'completed');

INSERT INTO order_items (id, order_id, product_id, quantity) VALUES
  (1, 1, 1, 2),
  (2, 1, 5, 1),
  (3, 2, 2, 1),
  (4, 3, 3, 1),
  (5, 4, 1, 5),
  (6, 5, 4, 1),
  (7, 5, 2, 2),
  (8, 6, 1, 1),
  (9, 7, 6, 1),
  (10, 8, 5, 3),
  (11, 9, 2, 1),
  (12, 9, 3, 1),
  (13, 10, 1, 10);
`,
};
