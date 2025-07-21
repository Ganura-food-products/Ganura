import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
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
  SupervisorsTableType,
  SupervisorField,
  LeaderField,
  SalesTableType,
  UserTable,
  GoodsTableType,
  CustomerForm,
  SeasonsTableType,
  SeasonForm,
  SeasonField,
} from './definitions';
import { formatCurrency } from './utils';
import { user } from '@nextui-org/theme';

export async function fetchRevenue(
  seasonId?: string,
  from?: string,
  to?: string
) {
  try {
    // For now, we'll calculate revenue from sales data if no revenue table exists
    // or return filtered revenue data if the table exists
    let data;

    if (seasonId && seasonId !== '' && from && to && from !== '' && to !== '') {
      // Try to get revenue data with season and date filters
      data = await sql<Revenue>`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          SUM(quantity * (SELECT sale_unit_price FROM products WHERE products.name = sales.product LIMIT 1)) as revenue
        FROM sales 
        WHERE season_id = ${seasonId} AND date BETWEEN ${from} AND ${to}
        GROUP BY EXTRACT(MONTH FROM date)
        ORDER BY month
      `;
    } else if (seasonId && seasonId !== '') {
      data = await sql<Revenue>`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          SUM(quantity * (SELECT sale_unit_price FROM products WHERE products.name = sales.product LIMIT 1)) as revenue
        FROM sales 
        WHERE season_id = ${seasonId}
        GROUP BY EXTRACT(MONTH FROM date)
        ORDER BY month
      `;
    } else if (from && to && from !== '' && to !== '') {
      data = await sql<Revenue>`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          SUM(quantity * (SELECT sale_unit_price FROM products WHERE products.name = sales.product LIMIT 1)) as revenue
        FROM sales 
        WHERE date BETWEEN ${from} AND ${to}
        GROUP BY EXTRACT(MONTH FROM date)
        ORDER BY month
      `;
    } else {
      // Fallback to original revenue table or calculate from sales
      try {
        data = await sql<Revenue>`SELECT * FROM revenue`;
      } catch {
        // If revenue table doesn't exist, calculate from sales
        data = await sql<Revenue>`
          SELECT 
            EXTRACT(MONTH FROM date) as month,
            SUM(quantity * (SELECT sale_unit_price FROM products WHERE products.name = sales.product LIMIT 1)) as revenue
          FROM sales 
          GROUP BY EXTRACT(MONTH FROM date)
          ORDER BY month
        `;
      }
    }

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchStockIn(
  seasonId?: string,
  from?: string,
  to?: string
) {
  try {
    let data;

    if (seasonId && seasonId !== '' && from && to && from !== '' && to !== '') {
      // Get stock-in data with season and date filters
      data = await sql<Revenue>`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          SUM(quantity) as revenue
        FROM goods 
        WHERE season_id = ${seasonId} AND date BETWEEN ${from} AND ${to}
        GROUP BY EXTRACT(MONTH FROM date)
        ORDER BY month
      `;
    } else if (seasonId && seasonId !== '') {
      data = await sql<Revenue>`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          SUM(quantity) as revenue
        FROM goods 
        WHERE season_id = ${seasonId}
        GROUP BY EXTRACT(MONTH FROM date)
        ORDER BY month
      `;
    } else if (from && to && from !== '' && to !== '') {
      data = await sql<Revenue>`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          SUM(quantity) as revenue
        FROM goods 
        WHERE date BETWEEN ${from} AND ${to}
        GROUP BY EXTRACT(MONTH FROM date)
        ORDER BY month
      `;
    } else {
      // Get all stock-in data
      data = await sql<Revenue>`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          SUM(quantity) as revenue
        FROM goods 
        GROUP BY EXTRACT(MONTH FROM date)
        ORDER BY month
      `;
    }

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch stock-in data.');
  }
}

export async function fetchLatestInvoices(
  seasonId?: string,
  query?: string,
  from?: string,
  to?: string
) {
  try {
    let data;

    if (seasonId && seasonId !== '' && from && to && from !== '' && to !== '') {
      data = await sql<LatestInvoiceRaw>`
        SELECT invoices.amount, farmers.name, farmers.email, invoices.id
        FROM invoices
        JOIN farmers ON invoices.customer_id = farmers.id
        WHERE farmers.season_id = ${seasonId} AND invoices.date BETWEEN ${from} AND ${to}
        ORDER BY invoices.date DESC
        LIMIT 5`;
    } else if (seasonId && seasonId !== '') {
      data = await sql<LatestInvoiceRaw>`
        SELECT invoices.amount, farmers.name, farmers.email, invoices.id
        FROM invoices
        JOIN farmers ON invoices.customer_id = farmers.id
        WHERE farmers.season_id = ${seasonId}
        ORDER BY invoices.date DESC
        LIMIT 5`;
    } else if (query && query !== '') {
      data = await sql<LatestInvoiceRaw>`
        SELECT invoices.amount, farmers.name, farmers.email, invoices.id
        FROM invoices
        JOIN farmers ON invoices.customer_id = farmers.id
        WHERE farmers.name ILIKE ${`%${query}%`}
        ORDER BY invoices.date DESC
        LIMIT 5`;
    } else {
      data = await sql<LatestInvoiceRaw>`
        SELECT invoices.amount, farmers.name, farmers.email, invoices.id
        FROM invoices
        JOIN farmers ON invoices.customer_id = farmers.id
        ORDER BY invoices.date DESC
        LIMIT 5`;
    }

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

export async function fetchCardData(
  seasonId?: string,
  query?: string,
  from?: string,
  to?: string
) {
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    // Conditional farmer count based on filters
    let farmerCountPromise;
    if (seasonId && seasonId !== '') {
      if (query && query !== '') {
        farmerCountPromise = sql`SELECT COUNT(*) FROM farmers WHERE season_id = ${seasonId} AND name ILIKE ${`%${query}%`}`;
      } else {
        farmerCountPromise = sql`SELECT COUNT(*) FROM farmers WHERE season_id = ${seasonId}`;
      }
    } else if (query && query !== '') {
      farmerCountPromise = sql`SELECT COUNT(*) FROM farmers WHERE name ILIKE ${`%${query}%`}`;
    } else {
      farmerCountPromise = sql`SELECT COUNT(*) FROM farmers`;
    }

    // Conditional total area based on filters
    let totalAreaPromise;
    if (seasonId && seasonId !== '') {
      if (query && query !== '') {
        totalAreaPromise = sql`SELECT SUM(area) FROM farmers WHERE season_id = ${seasonId} AND name ILIKE ${`%${query}%`}`;
      } else {
        totalAreaPromise = sql`SELECT SUM(area) FROM farmers WHERE season_id = ${seasonId}`;
      }
    } else if (query && query !== '') {
      totalAreaPromise = sql`SELECT SUM(area) FROM farmers WHERE name ILIKE ${`%${query}%`}`;
    } else {
      totalAreaPromise = sql`SELECT SUM(area) FROM farmers`;
    }

    // Conditional goods queries with season and date filtering
    let totalQuantityPromise;
    let totalQuantityBasilicSeedsStockPromise;
    let totalQuantityChiaSeedsStockPromise;

    if (seasonId && seasonId !== '' && from && to && from !== '' && to !== '') {
      totalQuantityPromise = sql`SELECT SUM(quantity) FROM goods WHERE season_id = ${seasonId} AND date BETWEEN ${from} AND ${to}`;
      totalQuantityBasilicSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE season_id = ${seasonId} AND date BETWEEN ${from} AND ${to} AND product = 'Basilic Seeds'`;
      totalQuantityChiaSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE season_id = ${seasonId} AND date BETWEEN ${from} AND ${to} AND product = 'Chia Seeds'`;
    } else if (seasonId && seasonId !== '') {
      totalQuantityPromise = sql`SELECT SUM(quantity) FROM goods WHERE season_id = ${seasonId}`;
      totalQuantityBasilicSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE season_id = ${seasonId} AND product = 'Basilic Seeds'`;
      totalQuantityChiaSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE season_id = ${seasonId} AND product = 'Chia Seeds'`;
    } else if (from && to && from !== '' && to !== '') {
      totalQuantityPromise = sql`SELECT SUM(quantity) FROM goods WHERE date BETWEEN ${from} AND ${to}`;
      totalQuantityBasilicSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE date BETWEEN ${from} AND ${to} AND product = 'Basilic Seeds'`;
      totalQuantityChiaSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE date BETWEEN ${from} AND ${to} AND product = 'Chia Seeds'`;
    } else {
      totalQuantityPromise = sql`SELECT SUM(quantity) FROM goods`;
      totalQuantityBasilicSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE product = 'Basilic Seeds'`;
      totalQuantityChiaSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE product = 'Chia Seeds'`;
    }

    // Conditional sales queries with season and date filtering
    let totalQuantitySalesPromise;
    let totalQuantityBasilicSeedsSalesPromise;
    let totalQuantityChiaSeedsSalesPromise;

    if (seasonId && seasonId !== '' && from && to && from !== '' && to !== '') {
      totalQuantitySalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE season_id = ${seasonId} AND date BETWEEN ${from} AND ${to}`;
      totalQuantityBasilicSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE season_id = ${seasonId} AND date BETWEEN ${from} AND ${to} AND product = 'Basilic Seeds'`;
      totalQuantityChiaSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE season_id = ${seasonId} AND date BETWEEN ${from} AND ${to} AND product = 'Chia Seeds'`;
    } else if (seasonId && seasonId !== '') {
      totalQuantitySalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE season_id = ${seasonId}`;
      totalQuantityBasilicSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE season_id = ${seasonId} AND product = 'Basilic Seeds'`;
      totalQuantityChiaSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE season_id = ${seasonId} AND product = 'Chia Seeds'`;
    } else if (from && to && from !== '' && to !== '') {
      totalQuantitySalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE date BETWEEN ${from} AND ${to}`;
      totalQuantityBasilicSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE date BETWEEN ${from} AND ${to} AND product = 'Basilic Seeds'`;
      totalQuantityChiaSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE date BETWEEN ${from} AND ${to} AND product = 'Chia Seeds'`;
    } else {
      totalQuantitySalesPromise = sql`SELECT SUM(quantity) FROM sales`;
      totalQuantityBasilicSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE product = 'Basilic Seeds'`;
      totalQuantityChiaSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE product = 'Chia Seeds'`;
    }

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
      farmerCountPromise,
      totalAreaPromise,
      totalQuantityPromise,
      totalQuantitySalesPromise,
      totalQuantityBasilicSeedsStockPromise,
      totalQuantityBasilicSeedsSalesPromise,
      totalQuantityChiaSeedsStockPromise,
      totalQuantityChiaSeedsSalesPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');
    const numberOfFarmers = Number(
      data[3].rows[0].count ?? '0'
    ).toLocaleString();
    const totalArea = Number(data[4].rows[0].sum ?? '0').toLocaleString();
    const totalQuantity = Number(data[5].rows[0].sum ?? '0');
    const totalQuantitySales = Number(data[6].rows[0].sum ?? '0');
    const totalQuantityBasilicSeedsStock = Number(data[7].rows[0].sum ?? '0');
    const totalQuantityBasilicSeedsSales = Number(data[8].rows[0].sum ?? '0');
    const totalQuantityChiaSeedsStock = Number(data[9].rows[0].sum ?? '0');
    const totalQuantityChiaSeedsSales = Number(data[10].rows[0].sum ?? '0');
    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
      numberOfFarmers,
      totalArea,
      totalQuantity,
      totalQuantitySales,
      totalQuantityBasilicSeedsStock,
      totalQuantityBasilicSeedsSales,
      totalQuantityChiaSeedsStock,
      totalQuantityChiaSeedsSales,
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
        farmers.name,
        farmers.phone_number,
        farmers.email
      FROM invoices
      JOIN farmers ON invoices.customer_id = farmers.id
      WHERE
        farmers.name ILIKE ${`%${query}%`} OR
        farmers.email ILIKE ${`%${query}%`} OR
        farmers.phone_number ILIKE ${`%${query}%`} OR
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

export async function fetchFilteredInvoicesNew(query: string) {
  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        farmers.name,
        farmers.phone_number,
        farmers.email
      FROM invoices
      JOIN farmers ON invoices.customer_id = farmers.id
      WHERE
        farmers.name ILIKE ${`%${query}%`} OR
        farmers.email ILIKE ${`%${query}%`} OR
        farmers.phone_number ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
    `;
    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices. new');
  }
}

export async function fetchFilteredUsers(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const users = await sql<UserTable>`
      SELECT * FROM users
      WHERE 
        users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`} OR
        users.role ILIKE ${`%${query}%`}
      ORDER BY users.name DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return users.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch filtered users.');
  }
}

export async function fetchUsersPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM users
    WHERE
      name ILIKE ${`%${query}%`} OR
      email ILIKE ${`%${query}%`} OR
      role ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of users.');
  }
}

export async function fetchUserById(id: string) {
  try {
    const data = await sql<UserTable>`
      SELECT *
      FROM users
      WHERE id = ${id}
    `;

    const user = data.rows;
    return user[0];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch farmer.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN farmers ON invoices.customer_id = farmers.id
    WHERE
      farmers.name ILIKE ${`%${query}%`} OR
      farmers.email ILIKE ${`%${query}%`} OR
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

export async function fetchCustomersPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM customers 
    WHERE 
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`}
     `;
    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of customers.');
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

export async function fetchProductById(id: string) {
  try {
    const data = await sql<ProductsTableType>`
      SELECT *
      FROM products
      WHERE products.id = ${id};
    `;

    const product = data.rows;

    return product[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch product .');
  }
}

export async function fetchCustomerById(id: string) {
  try {
    const data = await sql<CustomerForm>`
      SELECT 
        customers.id,
        customers.name,
        customers.email
      FROM customers
      WHERE customers.id = ${id}
    `;
    const customer = data.rows;
    return customer[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer 1.');
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
		  COUNT(sales.id) AS total_invoices,
      SUM(sales.quantity * products.sale_unit_price) AS total_paid
		FROM customers
		LEFT JOIN sales ON customers.name = sales.customer
    LEFT JOIN products On sales.product = products.name
		WHERE
		    customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
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
    const farmers = await sql<FarmersTableType & { total_goods: number }>`
      SELECT 
        farmers.*,
        seasons.name as season_name,
        COALESCE(SUM(goods.quantity), 0) AS total_goods
      FROM farmers
      LEFT JOIN goods ON goods.supplier = farmers.name
      LEFT JOIN seasons ON farmers.season_id = seasons.id
      WHERE farmers.name ILIKE ${`%${query}%`} OR
       farmers.email ILIKE ${`%${query}%`} OR
       farmers.city ILIKE ${`%${query}%`} OR
       farmers.district ILIKE ${`%${query}%`} OR
       farmers.sector ILIKE ${`%${query}%`} 
      GROUP BY farmers.id, farmers.name, farmers.phone_number, farmers.email, farmers.id_number, farmers.city, farmers.district, farmers.sector, farmers.cell, farmers.village, farmers.tin_number, farmers.company_name, farmers.team_leader_id, farmers.area, farmers.gender, farmers.field_supervisor, farmers.umusaruro, farmers.season_id, seasons.name
      ORDER BY farmers.name ASC
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

export async function fetchProductPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM products
    WHERE
      name ILIKE ${`%${query}%`} OR
      sale_unit_price::text ILIKE ${`%${query}%`} OR
      purchase_unit_price::text ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of product page.');
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

export async function fetchSupervisors() {
  try {
    const data = await sql<LeadersTableType>`
      SELECT *
      FROM supervisors
      
    `;

    const supervisors = data.rows;
    return supervisors;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch supervisor.');
  }
}

export async function fetchLeaderById(id: string) {
  try {
    const data = await sql<LeadersTableType>`
      SELECT *
      FROM leaders
      WHERE id = ${id}
    `;

    const leader = data.rows;
    return leader[0];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch leader.');
  }
}

export async function fetchFilteredGoods(
  query: string,
  currentPage: number,
  from: string,
  to: string,
  seasonId?: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    if (seasonId && seasonId !== '') {
      // Filter by season (with optional date and query filters)
      if (from !== '' && to !== '' && query !== '') {
        const goods = await sql<GoodsTableType>`
          SELECT goods.*, seasons.name as season_name 
          FROM goods 
          LEFT JOIN seasons ON goods.season_id = seasons.id
          WHERE 
            goods.season_id = ${seasonId} AND
            (supplier ILIKE ${`%${query}%`} OR product ILIKE ${`%${query}%`}) AND
            date BETWEEN ${from} AND ${to}
          ORDER BY supplier ASC 
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;
        return goods.rows;
      } else if (from !== '' && to !== '') {
        const goods = await sql<GoodsTableType>`
          SELECT goods.*, seasons.name as season_name 
          FROM goods 
          LEFT JOIN seasons ON goods.season_id = seasons.id
          WHERE
            goods.season_id = ${seasonId} AND
            date BETWEEN ${from} AND ${to}
          ORDER BY supplier ASC 
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;
        return goods.rows;
      } else if (query !== '') {
        const goods = await sql<GoodsTableType>`
          SELECT goods.*, seasons.name as season_name 
          FROM goods 
          LEFT JOIN seasons ON goods.season_id = seasons.id
          WHERE 
            goods.season_id = ${seasonId} AND
            (supplier ILIKE ${`%${query}%`} OR product ILIKE ${`%${query}%`})
          ORDER BY supplier ASC 
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;
        return goods.rows;
      } else {
        const goods = await sql<GoodsTableType>`
          SELECT goods.*, seasons.name as season_name 
          FROM goods 
          LEFT JOIN seasons ON goods.season_id = seasons.id
          WHERE goods.season_id = ${seasonId}
          ORDER BY supplier ASC 
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;
        return goods.rows;
      }
    } else if (from !== '' && to !== '' && query !== '') {
      const goods = await sql<GoodsTableType>`
        SELECT goods.*, seasons.name as season_name 
        FROM goods 
        LEFT JOIN seasons ON goods.season_id = seasons.id
        WHERE 
          (supplier ILIKE ${`%${query}%`} OR product ILIKE ${`%${query}%`}) AND
          date BETWEEN ${from} AND ${to}
        ORDER BY supplier ASC 
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
       `;
      return goods.rows;
    } else if (from !== '' && to !== '' && query === '') {
      const goods = await sql<GoodsTableType>`
        SELECT goods.*, seasons.name as season_name 
        FROM goods 
        LEFT JOIN seasons ON goods.season_id = seasons.id
        WHERE
          date BETWEEN ${from} AND ${to}
        ORDER BY supplier ASC 
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
       `;
      return goods.rows;
    } else {
      const goods = await sql<GoodsTableType>` 
      SELECT goods.*, seasons.name as season_name 
      FROM goods 
      LEFT JOIN seasons ON goods.season_id = seasons.id
      WHERE 
        supplier ILIKE ${`%${query}%`} OR 
        product ILIKE ${`%${query}%`}
      ORDER BY supplier ASC 
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset} `;
      return goods.rows;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch goods.');
  }
}

export async function fetchFilteredGoodsNew(
  query: string,
  from: string,
  to: string,
  seasonId?: string
) {
  try {
    if (seasonId && seasonId !== '') {
      // Filter by season (with optional date and query filters)
      if (from !== '' && to !== '' && query !== '') {
        const goods = await sql<GoodsTableType>`
          SELECT goods.*, seasons.name as season_name 
          FROM goods 
          LEFT JOIN seasons ON goods.season_id = seasons.id
          WHERE 
            goods.season_id = ${seasonId} AND
            (supplier ILIKE ${`%${query}%`} OR product ILIKE ${`%${query}%`}) AND
            date BETWEEN ${from} AND ${to}
          ORDER BY supplier ASC 
        `;
        return goods.rows;
      } else if (from !== '' && to !== '') {
        const goods = await sql<GoodsTableType>`
          SELECT goods.*, seasons.name as season_name 
          FROM goods 
          LEFT JOIN seasons ON goods.season_id = seasons.id
          WHERE
            goods.season_id = ${seasonId} AND
            date BETWEEN ${from} AND ${to}
          ORDER BY supplier ASC 
        `;
        return goods.rows;
      } else if (query !== '') {
        const goods = await sql<GoodsTableType>`
          SELECT goods.*, seasons.name as season_name 
          FROM goods 
          LEFT JOIN seasons ON goods.season_id = seasons.id
          WHERE 
            goods.season_id = ${seasonId} AND
            (supplier ILIKE ${`%${query}%`} OR product ILIKE ${`%${query}%`})
          ORDER BY supplier ASC 
        `;
        return goods.rows;
      } else {
        const goods = await sql<GoodsTableType>`
          SELECT goods.*, seasons.name as season_name 
          FROM goods 
          LEFT JOIN seasons ON goods.season_id = seasons.id
          WHERE goods.season_id = ${seasonId}
          ORDER BY supplier ASC 
        `;
        return goods.rows;
      }
    } else if (from !== '' && to !== '' && query !== '') {
      const goods = await sql<GoodsTableType>`
        SELECT goods.*, seasons.name as season_name 
        FROM goods 
        LEFT JOIN seasons ON goods.season_id = seasons.id
        WHERE 
          (supplier ILIKE ${`%${query}%`} OR product ILIKE ${`%${query}%`}) AND
          date BETWEEN ${`%${from}%`} AND ${`%${to}%`}
        ORDER BY supplier ASC 
       `;
      return goods.rows;
    } else if (from !== '' && to !== '' && query === '') {
      const goods = await sql<GoodsTableType>`
        SELECT goods.*, seasons.name as season_name 
        FROM goods 
        LEFT JOIN seasons ON goods.season_id = seasons.id
        WHERE
          date BETWEEN ${`%${from}%`} AND ${`%${to}%`}
        ORDER BY supplier ASC 
       `;
      return goods.rows;
    } else {
      const goods = await sql<GoodsTableType>` 
      SELECT goods.*, seasons.name as season_name 
      FROM goods 
      LEFT JOIN seasons ON goods.season_id = seasons.id
      WHERE 
        supplier ILIKE ${`%${query}%`} OR 
        product ILIKE ${`%${query}%`}
      ORDER BY supplier ASC 
 `;
      return goods.rows;
    }
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

export async function fetchFilteredSales(
  query: string,
  currentPage: number,
  from: string,
  to: string,
  seasonId?: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    if (seasonId && seasonId !== '') {
      // Filter by season (with optional date and query filters)
      if (from !== '' && to !== '' && query !== '') {
        const sales = await sql<SalesTableType>`
          SELECT sales.*, seasons.name as season_name 
          FROM sales 
          LEFT JOIN seasons ON sales.season_id = seasons.id
          WHERE 
            sales.season_id = ${seasonId} AND
            (product ILIKE ${`%${query}%`} OR customer ILIKE ${`%${query}%`}) AND
            date BETWEEN ${from} AND ${to}
          ORDER BY customer ASC 
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;
        return sales.rows;
      } else if (from !== '' && to !== '') {
        const sales = await sql<SalesTableType>`
          SELECT sales.*, seasons.name as season_name 
          FROM sales 
          LEFT JOIN seasons ON sales.season_id = seasons.id
          WHERE
            sales.season_id = ${seasonId} AND
            date BETWEEN ${from} AND ${to}
          ORDER BY customer ASC 
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;
        return sales.rows;
      } else if (query !== '') {
        const sales = await sql<SalesTableType>`
          SELECT sales.*, seasons.name as season_name 
          FROM sales 
          LEFT JOIN seasons ON sales.season_id = seasons.id
          WHERE 
            sales.season_id = ${seasonId} AND
            (product ILIKE ${`%${query}%`} OR customer ILIKE ${`%${query}%`})
          ORDER BY customer ASC 
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;
        return sales.rows;
      } else {
        const sales = await sql<SalesTableType>`
          SELECT sales.*, seasons.name as season_name 
          FROM sales 
          LEFT JOIN seasons ON sales.season_id = seasons.id
          WHERE sales.season_id = ${seasonId}
          ORDER BY customer ASC 
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;
        return sales.rows;
      }
    } else if (from !== '' && to !== '' && query !== '') {
      const sales = await sql<SalesTableType>`
        SELECT sales.*, seasons.name as season_name 
        FROM sales 
        LEFT JOIN seasons ON sales.season_id = seasons.id
        WHERE 
          ( product ILIKE ${`%${query}%`} OR customer ILIKE ${`%${query}%`}) AND 
          date BETWEEN ${from} AND ${to}
        ORDER BY customer ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
      return sales.rows;
    } else if (from !== '' && to !== '' && query === '') {
      const sales = await sql<SalesTableType>`
        SELECT sales.*, seasons.name as season_name 
        FROM sales 
        LEFT JOIN seasons ON sales.season_id = seasons.id
        WHERE 
          date BETWEEN ${from} AND ${to}
        ORDER BY customer ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
      return sales.rows;
    } else {
      const sales = await sql<SalesTableType>`
        SELECT sales.*, seasons.name as season_name 
        FROM sales 
        LEFT JOIN seasons ON sales.season_id = seasons.id
        WHERE 
           product ILIKE ${`%${query}%`} OR customer ILIKE ${`%${query}%`} 
        ORDER BY customer ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
      return sales.rows;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sales.');
  }
}
export async function fetchFilteredSalesNew(
  query: string,
  from: string,
  to: string,
  seasonId?: string
) {
  try {
    if (seasonId && seasonId !== '') {
      // Filter by season (with optional date and query filters)
      if (from !== '' && to !== '' && query !== '') {
        const sales = await sql<SalesTableType>`
          SELECT sales.*, seasons.name as season_name 
          FROM sales 
          LEFT JOIN seasons ON sales.season_id = seasons.id
          WHERE 
            sales.season_id = ${seasonId} AND
            (product ILIKE ${`%${query}%`} OR customer ILIKE ${`%${query}%`}) AND
            date BETWEEN ${from} AND ${to}
          ORDER BY customer ASC 
        `;
        return sales.rows;
      } else if (from !== '' && to !== '') {
        const sales = await sql<SalesTableType>`
          SELECT sales.*, seasons.name as season_name 
          FROM sales 
          LEFT JOIN seasons ON sales.season_id = seasons.id
          WHERE
            sales.season_id = ${seasonId} AND
            date BETWEEN ${from} AND ${to}
          ORDER BY customer ASC 
        `;
        return sales.rows;
      } else if (query !== '') {
        const sales = await sql<SalesTableType>`
          SELECT sales.*, seasons.name as season_name 
          FROM sales 
          LEFT JOIN seasons ON sales.season_id = seasons.id
          WHERE 
            sales.season_id = ${seasonId} AND
            (product ILIKE ${`%${query}%`} OR customer ILIKE ${`%${query}%`})
          ORDER BY customer ASC 
        `;
        return sales.rows;
      } else {
        const sales = await sql<SalesTableType>`
          SELECT sales.*, seasons.name as season_name 
          FROM sales 
          LEFT JOIN seasons ON sales.season_id = seasons.id
          WHERE sales.season_id = ${seasonId}
          ORDER BY customer ASC 
        `;
        return sales.rows;
      }
    } else if (from !== '' && to !== '' && query !== '') {
      const sales = await sql<SalesTableType>`
        SELECT sales.*, seasons.name as season_name 
        FROM sales 
        LEFT JOIN seasons ON sales.season_id = seasons.id
        WHERE 
          ( product ILIKE ${`%${query}%`} OR customer ILIKE ${`%${query}%`}) AND 
          date BETWEEN ${from} AND ${to}
        ORDER BY customer ASC
      `;
      return sales.rows;
    } else if (from !== '' && to !== '' && query === '') {
      const sales = await sql<SalesTableType>`
        SELECT sales.*, seasons.name as season_name 
        FROM sales 
        LEFT JOIN seasons ON sales.season_id = seasons.id
        WHERE 
          date BETWEEN ${from} AND ${to}
        ORDER BY customer ASC
      `;
      return sales.rows;
    } else {
      const sales = await sql<SalesTableType>`
        SELECT sales.*, seasons.name as season_name 
        FROM sales 
        LEFT JOIN seasons ON sales.season_id = seasons.id
        WHERE 
           product ILIKE ${`%${query}%`} OR customer ILIKE ${`%${query}%`} 
        ORDER BY customer ASC
      `;
      return sales.rows;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sales.');
  }
}

export async function fetchSaleById(id: string) {
  try {
    const data = await sql<SalesTableType>`
      SELECT *
      FROM sales 
      WHERE id = ${id} 
    `;
    const sale = data.rows;
    return sale[0];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch sales.');
  }
}

// Season Data Functions

export async function fetchFilteredSeasons(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const seasons = await sql<SeasonsTableType>`
      SELECT
        id,
        name,
        start_date,
        end_date,
        status,
        created_at
      FROM seasons
      WHERE
        name ILIKE ${`%${query}%`} OR
        status::text ILIKE ${`%${query}%`}
      ORDER BY created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return seasons.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch seasons.');
  }
}

export async function fetchSeasonsPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM seasons
    WHERE
      name ILIKE ${`%${query}%`} OR
      status::text ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of seasons.');
  }
}

export async function fetchSeasonById(id: string) {
  try {
    const data = await sql<SeasonForm>`
      SELECT
        id,
        name,
        start_date,
        end_date,
        status
      FROM seasons
      WHERE id = ${id};
    `;

    const season = data.rows.map((season) => ({
      ...season,
      start_date: season.start_date,
      end_date: season.end_date,
    }));

    return season[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch season.');
  }
}

export async function fetchSeasons() {
  try {
    const data = await sql<SeasonField>`
      SELECT
        id,
        name
      FROM seasons
      WHERE status = 'active'
      ORDER BY name ASC
    `;

    const seasons = data.rows;
    return seasons;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all seasons.');
  }
}

export async function fetchSeasonalOverview(seasonId: string) {
  try {
    // Get season details
    const seasonData = await sql`
      SELECT id, name, start_date, end_date
      FROM seasons 
      WHERE id = ${seasonId}
    `;

    if (seasonData.rows.length === 0) {
      throw new Error('Season not found');
    }

    const season = seasonData.rows[0];

    // Get current season statistics
    const [farmersResult, stockResult, salesResult] = await Promise.all([
      sql`SELECT COUNT(*) FROM farmers WHERE season_id = ${seasonId}`,
      sql`SELECT SUM(quantity) FROM goods WHERE season_id = ${seasonId}`,
      sql`SELECT SUM(quantity) FROM sales WHERE season_id = ${seasonId}`,
    ]);

    const totalFarmers = Number(farmersResult.rows[0].count ?? '0');
    const totalStock = Number(stockResult.rows[0].sum ?? '0');
    const totalSales = Number(salesResult.rows[0].sum ?? '0');

    // Calculate growth compared to previous season (simplified)
    const farmersGrowth = Math.floor(Math.random() * 20) - 10; // Mock data for now
    const stockGrowth = Math.floor(Math.random() * 30) - 15;
    const salesGrowth = Math.floor(Math.random() * 25) - 12;

    // Calculate days remaining
    const endDate = new Date(season.end_date);
    const today = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      seasonName: season.name,
      startDate: new Date(season.start_date).toLocaleDateString(),
      endDate: new Date(season.end_date).toLocaleDateString(),
      daysRemaining,
      totalFarmers,
      totalStock,
      totalSales,
      farmersGrowth,
      stockGrowth,
      salesGrowth,
    };
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch seasonal overview.');
  }
}
