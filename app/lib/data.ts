import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  FarmersTableType,
  LeadersTableType,
  ProductsTableType,
  LeaderField,
  SalesTableType,
  GoodsTableType,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    // console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;
    const farmerCountPromise = sql`SELECT COUNT(*) FROM farmers`;
    const totalAreaPromise = sql`SELECT SUM(area) FROM farmers`;
    const totalQuantityPromise = sql`SELECT SUM(quantity) FROM goods`;
    const totalQuantitySalesPromise = sql`SELECT SUM(quantity) FROM sales`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
      farmerCountPromise,
      totalAreaPromise,
      totalQuantityPromise,
      totalQuantitySalesPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');
    const numberOfFarmers = Number(
      data[3].rows[0].count ?? '0'
    ).toLocaleString();
    const totalArea = Number(data[4].rows[0].sum ?? '0').toLocaleString();
    const totalQuantity = Number(data[5].rows[0].sum ?? '0').toLocaleString();
    const totalQuantitySales = Number(
      data[6].rows[0].sum ?? '0'
    ).toLocaleString();

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
      numberOfFarmers,
      totalArea,
      totalQuantity,
      totalQuantitySales,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 8;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(
  query: string,
  currentPage: number
) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function fetchFarmers() {
  try {
    const data = await sql<FarmersTableType>`
      SELECT *
      FROM farmers
      ORDER BY name ASC
    `;

    const farmers = data.rows;
    return farmers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch farmers table.');
  }
}

export async function fetchFilteredFarmers(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const farmers = await sql<FarmersTableType>`
      SELECT *
      FROM farmers
      WHERE
        name ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return farmers.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch farmers.');
  }
}

export async function fetchFarmersPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM farmers
    WHERE
      name ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of farmers.');
  }
}

export async function fetchFarmerById(id: string) {
  try {
    const data = await sql<FarmersTableType>`
      SELECT *
      FROM farmers
      WHERE id = ${id}
    `;

    const farmer = data.rows;
    return farmer[0];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch farmer.');
  }
}

export async function fetchLeaders() {
  try {
    const data = await sql<LeaderField>`
      SELECT id, name
      FROM leaders
      ORDER BY name ASC
    `;

    const leaders = data.rows;
    return leaders;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch leaders table.');
  }
}

export async function fetchFilteredLeaders(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const leaders = await sql<LeadersTableType>`
      SELECT *
      FROM leaders
      WHERE
        name ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return leaders.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch leaders.');
  }
}

export async function fetchLeadersPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM leaders
    WHERE
      name ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of leaders.');
  }
}

export async function fetchProducts() {
  try {
    const data = await sql<ProductsTableType>`
      SELECT *
      FROM products
      ORDER BY name ASC
    `;

    const products = data.rows;
    return products;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch products table.');
  }
}

export async function fetchFilteredProducts(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const products = await sql<ProductsTableType>`
      SELECT *
      FROM products
      WHERE
        name ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return products.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

export async function fetchFilteredSupervisors(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const supervisors = await sql<LeadersTableType>`
      SELECT *
      FROM supervisors
      WHERE
        name ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return supervisors.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch supervisors.');
  }
}

export async function fetchSupervisorsPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM supervisors
    WHERE
      name ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of supervisors.');
  }
}

export async function fetchSupervisorById(id: string) {
  try {
    const data = await sql<LeadersTableType>`
      SELECT *
      FROM supervisors
      WHERE id = ${id}
    `;

    const supervisor = data.rows;
    return supervisor[0];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch supervisor.');
  }
}

export async function fetchFilteredGoods(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const goods = await sql<GoodsTableType>`
      SELECT *
      FROM goods
      WHERE
        supplier ILIKE ${`%${query}%`}
      ORDER BY supplier ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return goods.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch goods.');
  }
}

export async function fetchGoodsPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM goods
    WHERE
      supplier ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of stockin.');
  }
}

export async function fetchGoodsById(id: string) {
  try {
    const data = await sql<GoodsTableType>`
      SELECT *
      FROM goods
      WHERE id = ${id}
    `;

    const goods = data.rows;
    return goods[0];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch goods.');
  }
}

export async function fetchSales() {
  try {
    const data = await sql<SalesTableType>`
      SELECT
        products.name AS product,
        SUM(goods.quantity) AS quantity,
        SUM(goods.quantity * products.price) AS revenue
      FROM goods
      JOIN products ON goods.product_id = products.id
      GROUP BY products.name
      ORDER BY revenue DESC
    `;

    const sales = data.rows;
    return sales;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch sales data.');
  }
}

export async function fetchFilteredSales(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const sales = await sql<SalesTableType>`
      SELECT
        * FROM sales
    `;

    return sales.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sales.');
  }
}
