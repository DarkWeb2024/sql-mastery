# Database

All practice runs against a single seeded dataset called `company`, defined in
`src/content/datasets/company.ts`. It is created fresh in the browser using
SQLite (via sql.js) each session.

## Tables

### departments
| column   | type    | notes                |
|----------|---------|----------------------|
| id       | INTEGER | primary key          |
| name     | TEXT    | department name      |
| location | TEXT    | office city          |

### employees
| column        | type    | notes                                   |
|---------------|---------|-----------------------------------------|
| id            | INTEGER | primary key                             |
| name          | TEXT    | employee name                           |
| department_id | INTEGER | references departments(id)              |
| salary        | INTEGER | annual salary                           |
| hire_date     | TEXT    | ISO date                                |
| manager_id    | INTEGER | references employees(id), NULL if none  |

### customers
| column      | type    | notes        |
|-------------|---------|--------------|
| id          | INTEGER | primary key  |
| name        | TEXT    | company name |
| city        | TEXT    |              |
| country     | TEXT    |              |
| signup_date | TEXT    | ISO date     |

### products
| column   | type    | notes                  |
|----------|---------|------------------------|
| id       | INTEGER | primary key            |
| name     | TEXT    | product name           |
| category | TEXT    | Software or Service    |
| price    | REAL    | unit price             |

### orders
| column      | type    | notes                                 |
|-------------|---------|---------------------------------------|
| id          | INTEGER | primary key                           |
| customer_id | INTEGER | references customers(id)              |
| order_date  | TEXT    | ISO date                              |
| status      | TEXT    | completed, pending, or cancelled      |

### order_items
| column     | type    | notes                    |
|------------|---------|--------------------------|
| id         | INTEGER | primary key              |
| order_id   | INTEGER | references orders(id)    |
| product_id | INTEGER | references products(id)  |
| quantity   | INTEGER | units ordered            |

## Relationships

- An employee belongs to one department and may report to one manager who is
  another employee.
- A customer places many orders. One customer (Vandelay Industries) has no
  orders, which makes LEFT JOIN exercises meaningful.
- An order contains many order items, each referencing a product.

## Why one core dataset

Keeping most questions on the same schema lets learners build a mental model of
the data rather than relearning a new schema for each question. Datasets live in
`src/content/datasets` (registered in `index.ts`) and a question selects one via
its `datasetId`.

## The sales dataset

Window-function and analytics practice uses a second dataset, `sales`, a regional
sales time-series. Its shape suits ranking and time-based windowing.

### sales
| column | type    | notes                                  |
|--------|---------|----------------------------------------|
| id     | INTEGER | primary key                            |
| region | TEXT    | North, South, East, or West            |
| rep    | TEXT    | sales representative                   |
| month  | TEXT    | YYYY-MM, four months in 2023           |
| amount | INTEGER | sales amount for that rep and month    |

Amounts are kept distinct within each region so ranking questions have a single
unambiguous answer.
