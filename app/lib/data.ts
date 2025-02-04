import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";
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
} from "./definitions";
import { formatCurrency } from "./utils";
import { user } from "@nextui-org/theme";

export async function fetchRevenue() {
  try {
    const data = await sql<Revenue>`SELECT * FROM revenue`;

    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, farmers.name, farmers.email, invoices.id
      FROM invoices
      JOIN farmers ON invoices.customer_id = farmers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
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
    const totalQuantityBasilicSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE product='Basilic Seeds'`;
    const totalQuantityBasilicSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE product='Basilic Seeds'`;
    const totalQuantityChiaSeedsStockPromise = sql`SELECT SUM(quantity) FROM goods WHERE product='Chia Seeds'`;
    const totalQuantityChiaSeedsSalesPromise = sql`SELECT SUM(quantity) FROM sales WHERE product='Chia Seeds'`;

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

    const numberOfInvoices = Number(data[0].rows[0].count ?? "0");
    const numberOfCustomers = Number(data[1].rows[0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? "0");
    const numberOfFarmers = Number(
      data[3].rows[0].count ?? "0"
    ).toLocaleString();
    const totalArea = Number(data[4].rows[0].sum ?? "0").toLocaleString();
    const totalQuantity = Number(data[5].rows[0].sum ?? "0");
    const totalQuantitySales = Number(data[6].rows[0].sum ?? "0");
    const totalQuantityBasilicSeedsStock = Number(data[7].rows[0].sum ?? "0");
    const totalQuantityBasilicSeedsSales = Number(data[8].rows[0].sum ?? "0");
    const totalQuantityChiaSeedsStock = Number(data[9].rows[0].sum ?? "0");
    const totalQuantityChiaSeedsSales = Number(data[10].rows[0].sum ?? "0");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
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
        farmers.email
      FROM invoices
      JOIN farmers ON invoices.customer_id = farmers.id
      WHERE
        farmers.name ILIKE ${`%${query}%`} OR
        farmers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchFilteredUsers(
  query: string,
  currentPage: number
) {
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch filtered users.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of users.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch farmer.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of customers.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchProductById(id:string){
  try {
    const data = await sql<ProductsTableType>`
      SELECT *
      FROM products
      WHERE products.id = ${id};
    `;

    const product = data.rows

    return product[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch product .");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customer 1.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch farmers table.");
  }
}

export async function fetchFilteredFarmers(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const farmers = await sql<FarmersTableType & { total_goods: number }>`
      SELECT 
        farmers.*,
        COALESCE(SUM(goods.quantity), 0) AS total_goods
      FROM farmers
      LEFT JOIN goods ON goods.supplier = farmers.name
      WHERE farmers.name ILIKE ${`%${query}%`} OR
       farmerS.email ILIKE ${`%${query}%`} OR
       farmers.city ILIKE ${`%${query}%`} OR
       farmers.district ILIKE ${`%${query}%`} OR
       farmers.sector ILIKE ${`%${query}%`} 
      GROUP BY farmers.id, farmers.name, farmers.phone_number, farmers.email, farmers.id_number, farmers.city, farmers.district, farmers.sector, farmers.cell, farmers.village, farmers.tin_number, farmers.company_name, farmers.team_leader_id, farmers.area, farmers.gender, farmers.field_supervisor, farmers.umusaruro
      ORDER BY farmers.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return farmers.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch farmers.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of farmers.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of product page.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch farmer.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch leaders table.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch leaders.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of leaders.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch products table.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch products.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch supervisors.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of supervisors.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch supervisor.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch supervisor.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch leader.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch goods.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of stockin.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch goods.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch sales data.");
  }
}

export async function fetchFilteredSales(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const sales = await sql<SalesTableType>`
      SELECT * 
      FROM sales
      WHERE 
        product ILIKE ${`%${query}%`} OR
        customer ILIKE ${`%${query}%`} OR
        date::text ILIKE ${`%${query}%`}
      ORDER BY customer ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return sales.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch sales.");
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
    console.error("Database Error:", err);
    throw new Error("Failed to fetch sales.");
  }
}
