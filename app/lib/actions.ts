'use server';

import { z, date } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const FarmerSchema = z.object({
  id: z.string(),
  name: z.string(),
  id_number: z.string(),
  phone_number: z.string(),
  city: z.string(),
  district: z.string(),
  sector: z.string(),
  cell: z.string(),
  village: z.string(),
  team_leader_id: z.string(),
  date: z.string(),
  area: z.string(),
});

const LeaderSchema = z.object({
  id: z.string(),
  name: z.string(),
  id_number: z.string(),
  phone_number: z.string(),
  city: z.string(),
  district: z.string(),
  sector: z.string(),
  cell: z.string(),
  village: z.string(),
  supervisor_id: z.string(),
  date: z.string(),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  purchase_unit_price: z.coerce
    .number()
    .gt(0, { message: 'Please enter a purchase price greater than $0.' }),
  sale_unit_price: z.coerce
    .number()
    .gt(0, { message: 'Please enter a sale price greater than $0.' }),
  unit: z.string(),
  date: z.string(),
});

const GoodsSchema = z.object({
  id: z.string(),
  product: z.string(),
  supplier: z.string(),
  quantity: z.coerce
    .number()
    .gt(0, { message: 'Please enter a quantity greater than 0.' }),
  stock_date: z.string(),
});

const SalesSchema = z.object({
  id: z.string(),
  product: z.string(),
  customer: z.string(),
  quantity: z.coerce
    .number()
    .gt(0, { message: 'Please enter a quantity greater than 0.' }),
  sale_date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateFarmer = FarmerSchema.omit({ id: true, date: true });
const UpdateFarmer = FarmerSchema.omit({ id: true, date: true });
const CreateProduct = ProductSchema.omit({ id: true, date: true });
const CreateLeader = LeaderSchema.omit({ id: true, date: true });
const UpdateLeader = LeaderSchema.omit({ id: true, date: true });
const CreateGoods = GoodsSchema.omit({ id: true });
const UpdateGoods = GoodsSchema.omit({ id: true });
const CreateSales = SalesSchema.omit({ id: true });

export type State = {
  errors?: {
    customer?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type FarmerState = {
  errors?: {
    name?: string[];
    id_number?: string[];
    phone_number?: string[];
    city?: string[];
    district?: string[];
    sector?: string[];
    cell?: string[];
    village?: string[];
    team_leader_id?: string[];
    area?: number[];
  };
  message?: string | null;
};

export type LeaderState = {
  errors?: {
    name?: string[];
    id_number?: string[];
    phone_number?: string[];
    city?: string[];
    district?: string[];
    sector?: string[];
    cell?: string[];
    village?: string[];
    supervisor_id?: string[];
  };
  message?: string | null;
};

export type ProductState = {
  errors?: {
    name?: string[];
    purchase_unit_price?: string[];
    sale_unit_price?: string[];
    unit?: string[];
  };
  message?: string | null;
};

export type GoodsState = {
  errors?: {
    product?: string[];
    supplier?: string[];
    quantity?: string[];
    stock_date?: string[];
  };
  message?: string | null;
};

export type SalesState = {
  errors?: {
    product?: string[];
    customer?: string[];
    quantity?: string[];
    sale_date?: any;
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function createFarmer(prevState: State, formData: FormData) {
  const validatedFields = CreateFarmer.safeParse({
    name: formData.get('name'),
    id_number: formData.get('id_number'),
    phone_number: formData.get('phone_number'),
    city: formData.get('city'),
    district: formData.get('district'),
    sector: formData.get('sector'),
    cell: formData.get('cell'),
    village: formData.get('village'),
    team_leader_id: formData.get('team_leader_id'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Farmer.',
    };
  }

  const {
    name,
    id_number,
    phone_number,
    city,
    district,
    sector,
    cell,
    village,
    team_leader_id,
    area,
  } = validatedFields.data;

  try {
    await sql`
      INSERT INTO farmers (name, id_number, phone_number, city, district, sector, cell, village, team_leader_id), area
      VALUES (${name}, ${id_number}, ${phone_number}, ${city}, ${district}, ${sector}, ${cell}, ${village}, ${team_leader_id}, ${area})
    `;
  } catch (error: any) {
    console.error('Error inserting farmer:', error.message);
    return {
      message: `Database Error: Failed to Create Farmer. ${
        error.message || ''
      }`,
    };
  }

  revalidatePath('/dashboard/farmers');
  redirect('/dashboard/farmers');
}

export async function updateFarmer(
  id: string,
  prevState: FarmerState,
  formData: FormData
) {
  const validatedFields = UpdateFarmer.safeParse({
    name: formData.get('name'),
    id_number: formData.get('id_number'),
    phone_number: formData.get('phone_number'),
    city: formData.get('city'),
    district: formData.get('district'),
    sector: formData.get('sector'),
    cell: formData.get('cell'),
    village: formData.get('village'),
    team_leader_id: formData.get('team_leader_id'),
    area: formData.get('area'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Farmer.',
    };
  }

  const {
    name,
    id_number,
    phone_number,
    city,
    district,
    sector,
    cell,
    village,
    team_leader_id,
    area,
  } = validatedFields.data;

  try {
    await sql`
      UPDATE farmers
      SET name = ${name}, id_number = ${id_number}, phone_number = ${phone_number}, city = ${city}, district = ${district}, sector = ${sector}, cell = ${cell}, village = ${village}, team_leader_id = ${team_leader_id}, area = ${area}
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.error('Error updating farmer:', error.message);
    return {
      message: `Database Error: Failed to Update Farmer. ${
        error.message || ''
      }`,
    };
  }

  revalidatePath('/dashboard/farmers');
  redirect('/dashboard/farmers');
}

export async function deleteFarmer(id: string) {
  try {
    await sql`DELETE FROM farmers WHERE id = ${id}`;
    revalidatePath('/dashboard/farmers');
    return { message: 'Deleted Farmer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Farmer.' };
  }
}

export async function createLeader(prevState: LeaderState, formData: FormData) {
  const validatedFields = CreateLeader.safeParse({
    name: formData.get('name'),
    id_number: formData.get('id_number'),
    phone_number: formData.get('phone_number'),
    city: formData.get('city'),
    district: formData.get('district'),
    sector: formData.get('sector'),
    cell: formData.get('cell'),
    village: formData.get('village'),
    supervisor_id: formData.get('supervisor_id'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Leader.',
    };
  }

  const {
    name,
    id_number,
    phone_number,
    city,
    district,
    sector,
    cell,
    village,
    supervisor_id,
  } = validatedFields.data;

  try {
    await sql`
      INSERT INTO leaders (name, id_number, phone_number, city, district, sector, cell, village, supervisor_id)
      VALUES (${name}, ${id_number}, ${phone_number}, ${city}, ${district}, ${sector}, ${cell}, ${village}, ${supervisor_id})
    `;
  } catch (error: any) {
    console.error('Error inserting leader:', error.message);
    return {
      message: `Database Error: Failed to Create Leader. ${
        error.message || ''
      }`,
    };
  }

  revalidatePath('/dashboard/leaders');
  redirect('/dashboard/leaders');
}

export async function updateLeader(
  id: string,
  prevState: LeaderState,
  formData: FormData
) {
  const validatedFields = UpdateLeader.safeParse({
    name: formData.get('name'),
    id_number: formData.get('id_number'),
    phone_number: formData.get('phone_number'),
    city: formData.get('city'),
    district: formData.get('district'),
    sector: formData.get('sector'),
    cell: formData.get('cell'),
    village: formData.get('village'),
    supervisor_id: formData.get('supervisor_id'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Leader.',
    };
  }

  const {
    name,
    id_number,
    phone_number,
    city,
    district,
    sector,
    cell,
    village,
    supervisor_id,
  } = validatedFields.data;

  try {
    await sql`
      UPDATE leaders
      SET name = ${name}, id_number = ${id_number}, phone_number = ${phone_number}, city = ${city}, district = ${district}, sector = ${sector}, cell = ${cell}, village = ${village}, supervisor_id = ${supervisor_id}
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.error('Error updating leader:', error.message);
    return {
      message: `Database Error: Failed to Update Leader. ${
        error.message || ''
      }`,
    };
  }

  revalidatePath('/dashboard/leaders');
  redirect('/dashboard/leaders');
}

export async function deleteLeader(id: string) {
  try {
    await sql`DELETE FROM leaders WHERE id = ${id}`;
    revalidatePath('/dashboard/leaders');
    return { message: 'Deleted Leader.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Leader.' };
  }
}

export async function createProduct(prevState: State, formData: FormData) {
  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    purchase_unit_price: formData.get('purchase_unit_price'),
    sale_unit_price: formData.get('sale_unit_price'),
    unit: formData.get('unit'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { name, purchase_unit_price, sale_unit_price, unit } =
    validatedFields.data;

  try {
    await sql`
      INSERT INTO products (name, purchase_unit_price, sale_unit_price, unit)
      VALUES (${name}, ${purchase_unit_price}, ${sale_unit_price}, ${unit})
    `;
  } catch (error: any) {
    console.error('Error inserting product:', error.message);
    return {
      message: `Database Error: Failed to Create Product. ${
        error.message || ''
      }`,
    };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function updateProduct(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    purchase_unit_price: formData.get('purchase_unit_price'),
    sale_unit_price: formData.get('sale_unit_price'),
    unit: formData.get('unit'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }

  const { name, purchase_unit_price, sale_unit_price, unit } =
    validatedFields.data;

  try {
    await sql`
      UPDATE products
      SET name = ${name}, purchase_unit_price = ${purchase_unit_price}, sale_unit_price = ${sale_unit_price}, unit = ${unit}
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.error('Error updating product:', error.message);
    return {
      message: `Database Error: Failed to Update Product. ${
        error.message || ''
      }`,
    };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function deleteProduct(id: string) {
  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
    revalidatePath('/dashboard/products');
    return { message: 'Deleted Product.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Product.' };
  }
}

export async function createGoods(prevState: GoodsState, formData: FormData) {
  const validatedFields = CreateGoods.safeParse({
    product: formData.get('product'),
    supplier: formData.get('supplier'),
    quantity: formData.get('quantity'),
    stock_date: formData.get('date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Goods.',
    };
  }

  const { product, supplier, quantity, stock_date } = validatedFields.data;

  try {
    await sql`
      INSERT INTO goods (product, supplier, quantity, date)
      VALUES (${product}, ${supplier}, ${quantity}, ${stock_date})
    `;
  } catch (error: any) {
    console.error('Error inserting goods:', error.message);
    return {
      message: `Database Error: Failed to Create Goods. ${error.message || ''}`,
    };
  }

  revalidatePath('/dashboard/stock-in');
  redirect('/dashboard/stock-in');
}

export async function updateGoods(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = CreateGoods.safeParse({
    product: formData.get('product'),
    supplier: formData.get('supplier'),
    quantity: formData.get('quantity'),
    stock_date: formData.get('date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Goods.',
    };
  }

  const { product, supplier, quantity, stock_date } = validatedFields.data;

  try {
    await sql`
      UPDATE goods
      SET product = ${product}, supplier = ${supplier}, quantity = ${quantity}, date = ${stock_date}
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.error('Error updating goods:', error.message);
    return {
      message: `Database Error: Failed to Update Goods. ${error.message || ''}`,
    };
  }

  revalidatePath('/dashboard/stock-in');
  redirect('/dashboard/stock-in');
}

export async function deleteGoods(id: string) {
  try {
    await sql`DELETE FROM goods WHERE id = ${id}`;
    revalidatePath('/dashboard/stock-in');
    return { message: 'Deleted Goods.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Goods.' };
  }
}

export async function createSales(prevState: SalesState, formData: FormData) {
  const validatedFields = CreateSales.safeParse({
    product: formData.get('product'),
    customer: formData.get('customer'),
    quantity: formData.get('quantity'),
    sale_date: formData.get('sale_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Sales.',
    };
  }

  const { product, customer, quantity, sale_date } = validatedFields.data;

  try {
    await sql`
      INSERT INTO sales (product, customer, quantity, date)
      VALUES (${product}, ${customer}, ${quantity}, ${sale_date})
    `;
  } catch (error: any) {
    console.error('Error inserting sales:', error.message);
    return {
      message: `Database Error: Failed to Create Sales. ${error.message || ''}`,
    };
  }

  revalidatePath('/dashboard/stock-out');
  redirect('/dashboard/stock-out');
}

export async function updateSales(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = CreateSales.safeParse({
    product: formData.get('product'),
    customer: formData.get('customer'),
    quantity: formData.get('quantity'),
    sale_date: formData.get('sale_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Sales.',
    };
  }

  const { product, customer, quantity, sale_date } = validatedFields.data;

  try {
    await sql`
      UPDATE sales
      SET product = ${product}, customer = ${customer}, quantity = ${quantity}, date = ${sale_date}
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.error('Error updating sales:', error.message);
    return {
      message: `Database Error: Failed to Update Sales. ${error.message || ''}`,
    };
  }

  revalidatePath('/dashboard/stock-out');
  redirect('/dashboard/stock-out');
}

export async function deleteSales(id: string) {
  try {
    await sql`DELETE FROM sales WHERE id = ${id}`;
    revalidatePath('/dashboard/stock-out');
    return { message: 'Deleted Sales.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Sales.' };
  }
}
