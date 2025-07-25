'use server';

import { z, date } from 'zod';
import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  farmerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than RFW0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const FarmerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name cannot be empty'),
  id_number: z.string().min(10, 'ID must be at least 10 characters long'),
  phone_number: z
    .string()
    .min(8, 'Phone number must be at least 8 characters long'),
  city: z.string().min(1, 'city cannot be empty'),
  district: z.string().min(1, 'district cannot be empty'),
  sector: z.string().min(1, 'sector cannot be empty'),
  cell: z.string().min(1, 'cell cannot be empty'),
  village: z.string().min(1, 'village cannot be empty'),
  team_leader_id: z
    .string()
    .min(1, 'team leader must be selected cannot be empty'),
  date: z.string(),
  area: z.coerce
    .number()
    .gt(0, { message: 'Please enter an area greater than 0.' }),
  season_id: z.string().min(1, 'Season must be selected'),
});

const LeaderSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name cannot be empty'),
  id_number: z.string().min(10, 'ID must be at least 10 characters long'),
  phone_number: z
    .string()
    .min(8, 'Phone number must be at least 8 characters long'),
  city: z.string().min(1, 'city cannot be empty'),
  district: z.string().min(1, 'district cannot be empty'),
  sector: z.string().min(1, 'sector cannot be empty'),
  cell: z.string().min(1, 'cell cannot be empty'),
  village: z.string().min(1, 'village cannot be empty'),
  supervisor_id: z.string().min(1, 'please choose'),
  date: z.string(),
});

const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name cannot be empty'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(9, 'password must be atleast 9 characters'),
  role: z.enum(['admin', 'user', 'accountant'], {
    invalid_type_error: 'Please select an user role.',
  }),
});

const SupervisorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name cannot be empty'),
  id_number: z.string().min(8, 'id must be at least 8 characters long'),
  phone_number: z
    .string()
    .min(8, 'Phone number must be at least 8 characters long'),
  city: z.string().min(1, 'city cannot be empty'),
  district: z.string().min(1, 'district cannot be empty'),
  sector: z.string().min(1, 'sector cannot be empty'),
  cell: z.string().min(1, 'cell cannot be empty'),
  village: z.string().min(1, 'village cannot be empty'),

  date: z.string(),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  purchase_unit_price: z.coerce
    .number()
    .gt(0, { message: 'Please enter a purchase price greater than RFW0.' }),
  sale_unit_price: z.coerce
    .number()
    .gt(0, { message: 'Please enter a sale price greater than RFW0.' }),
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
  season_id: z.string().min(1, 'Season must be selected'),
});

const SalesSchema = z.object({
  id: z.string(),
  product: z.string(),
  customer: z.string(),
  quantity: z.coerce
    .number()
    .gt(0, { message: 'Please enter a quantity greater than 0.' }),
  date: z.string(),
});

const CustomersSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name cannot be empty'),
  email: z.string().email('Invalid email address'),
  image_url: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateFarmer = FarmerSchema.omit({ id: true, date: true });
const UpdateFarmer = FarmerSchema.omit({ id: true, date: true });
const CreateProduct = ProductSchema.omit({ id: true, date: true });
const CreateLeader = LeaderSchema.omit({ id: true, date: true });
const CreateSupervisor = SupervisorSchema.omit({ id: true, date: true });
const UpdateLeader = LeaderSchema.omit({ id: true, date: true });
const CreateGoods = GoodsSchema.omit({ id: true });
const UpdateGoods = GoodsSchema.omit({ id: true });
const CreateSales = SalesSchema.omit({ id: true });
const CreateUser = UserSchema.omit({ id: true });
const UpdateSales = SalesSchema.omit({ id: true });
const CreateCustomers = CustomersSchema.omit({ id: true, image_url: true });

export type State = {
  errors?: {
    customer?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export type newState = {
  errors?: {
    farmerId?: string[];
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
    area?: string[];
    season_id?: string[];
  };
  message?: string | null;
};

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
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

export type SupervisorState = {
  errors?: {
    name?: string[];
    id_number?: string[];
    phone_number?: string[];
    city?: string[];
    district?: string[];
    sector?: string[];
    cell?: string[];
    village?: string[];
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
    season_id?: string[];
  };
  message?: string | null;
};

export type SalesState = {
  errors?: {
    product?: string[];
    customer?: string[];
    quantity?: string[];
    date?: string[];
  };
  message?: string | null;
};

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData
) {
  const validatedFields = CreateCustomers.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create customer.',
    };
  }
  const { name, email } = validatedFields.data;

  const imageUrl =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJdNruTMM_5xvR_Sw3TXosFo9_wMufcdr9zLunLWnJ1EkphfQ03WwjxnA&s';
  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.log('failed customet');
    console.log(error);
    return {
      message: 'Database Error: Failed to Create customer.',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function createUser(prevState: UserState, formData: FormData) {
  const validatedFields = CreateUser.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create customer.',
    };
  }
  const { name, email, password, role } = validatedFields.data;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO users (name,email,password,role)
      VALUES (${name},${email},${hashedPassword},${role})
    `;
  } catch (error) {
    console.log('failed create user');
    console.log(error);
    return {
      message: 'Database Error: Failed to Create user.',
    };
  }
  revalidatePath('/dashboard/users');
  redirect('/dashboard/users');
}

export async function updateUser(
  id: string,
  prevState: UserState,
  formData: FormData
) {
  const validatedFields = CreateUser.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
  const { name, email, password, role } = validatedFields.data;

  try {
    await sql`
      UPDATE users
      SET name = ${name},email = ${email}, password = ${password}, role= ${role}
      WHERE id = ${id}  
    `;
  } catch (error) {
    console.log('update user failed');
    console.log(error);
    return { message: 'Database Error: Failed to Update user.' };
  }
  revalidatePath('/dashboard/users');
  redirect('/dashboard/users');
}

export async function deleteUser(id: string) {
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    revalidatePath('/dashboard/users');
    return { message: 'Deleted user.' };
  } catch (error) {
    console.log('failed to delete user bcz', error);
    return { message: 'Database Error: Failed to Delete user.' };
  }
}

export async function createInvoice(prevState: newState, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    farmerId: formData.get('farmerId'),
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
  const { farmerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${farmerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.log('failed invoice');
    console.log(error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData
) {
  const validatedFields = CreateCustomers.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update customer.',
    };
  }
  const { name, email } = validatedFields.data;
  try {
    await sql`
      UPDATE customers
      SET name = ${name} , email = ${email}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.log('jsadncajsdnkcsjdk error upda');
    console.log(error);
    return { message: 'Database Error: Failed to Update customer.' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateInvoice(
  id: string,
  prevState: newState,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    farmerId: formData.get('farmerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { farmerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${farmerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.log('jsadncajsdnkcsjdk error upda');
    console.log(error);
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
    console.log('failed to delete bcz', error);
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

export async function createFarmer(prevState: FarmerState, formData: FormData) {
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
    area: formData.get('area'),
    season_id: formData.get('season_id'),
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
    season_id,
  } = validatedFields.data;

  try {
    await sql`
      INSERT INTO farmers (name, id_number, phone_number, city, district, sector, cell, village, team_leader_id, area, season_id)
      VALUES (${name}, ${id_number}, ${phone_number}, ${city}, ${district}, ${sector}, ${cell}, ${village}, ${team_leader_id}, ${area}, ${season_id})
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
    season_id: formData.get('season_id'),
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
    season_id,
  } = validatedFields.data;

  try {
    await sql`
      UPDATE farmers
      SET name = ${name}, id_number = ${id_number}, phone_number = ${phone_number}, city = ${city}, district = ${district}, sector = ${sector}, cell = ${cell}, village = ${village}, team_leader_id = ${team_leader_id}, area = ${area}, season_id = ${season_id}
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

export async function createSupervisor(
  prevState: SupervisorState,
  formData: FormData
) {
  const validatedFields = CreateSupervisor.safeParse({
    name: formData.get('name'),
    id_number: formData.get('id_number'),
    phone_number: formData.get('phone_number'),
    city: formData.get('city'),
    district: formData.get('district'),
    sector: formData.get('sector'),
    cell: formData.get('cell'),
    village: formData.get('village'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create suppervisor.',
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
  } = validatedFields.data;

  try {
    await sql`
      INSERT INTO supervisors (name, id_number, phone_number, city, district, sector, cell, village)
      VALUES (${name}, ${id_number}, ${phone_number}, ${city}, ${district}, ${sector}, ${cell}, ${village})
    `;
  } catch (error: any) {
    console.error('Error inserting supervisor:', error.message);
    return {
      message: `Database Error: Failed to Create supervisor. ${
        error.message || ''
      }`,
    };
  }

  revalidatePath('/dashboard/supervisors');
  redirect('/dashboard/supervisors');
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

export async function updateSupervisor(
  id: string,
  prevState: SupervisorState,
  formData: FormData
) {
  const validatedFields = CreateSupervisor.safeParse({
    name: formData.get('name'),
    id_number: formData.get('id_number'),
    phone_number: formData.get('phone_number'),
    city: formData.get('city'),
    district: formData.get('district'),
    sector: formData.get('sector'),
    cell: formData.get('cell'),
    village: formData.get('village'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update supervisor.',
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
  } = validatedFields.data;
  try {
    await sql`
      UPDATE supervisors
      SET name = ${name}, id_number = ${id_number}, phone_number = ${phone_number}, city = ${city}, district = ${district}, sector = ${sector}, cell = ${cell}, village = ${village}
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.error('Error updating supervisor:', error.message);
    return {
      message: `Database Error: Failed to Update supervisor. ${
        error.message || ''
      }`,
    };
  }
  revalidatePath('/dashboard/supervisors');
  redirect('/dashboard/supervisors');
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

export async function deleteSupervisor(id: string) {
  try {
    await sql`DELETE FROM supervisors WHERE id = ${id}`;
    revalidatePath('/dashboard/supervisors');
    return { message: 'Deleted super.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete super.' };
  }
}

export async function createProduct(
  prevState: ProductState,
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
  prevState: ProductState,
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
    season_id: formData.get('season_id'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Goods.',
    };
  }

  const { product, supplier, quantity, stock_date, season_id } =
    validatedFields.data;

  try {
    await sql`
      INSERT INTO goods (product, supplier, quantity, date, season_id)
      VALUES (${product}, ${supplier}, ${quantity}, ${stock_date}, ${season_id})
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
  prevState: GoodsState,
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
    date: formData.get('sale_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Sales.',
    };
  }

  const { product, customer, quantity, date } = validatedFields.data;

  try {
    await sql`
      INSERT INTO sales (product, customer, quantity, date)
      VALUES (${product}, ${customer}, ${quantity}, ${date})
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
  prevState: SalesState,
  formData: FormData
) {
  const validatedFields = CreateSales.safeParse({
    product: formData.get('product'),
    customer: formData.get('customer'),
    quantity: formData.get('quantity'),
    date: formData.get('sale_date'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Sales.',
    };
  }

  const { product, customer, quantity, date } = validatedFields.data;

  try {
    await sql`
      UPDATE sales
      SET product = ${product}, customer = ${customer}, quantity = ${quantity}, date = ${date}
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.log('error updatinf', error);
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

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath('/dashboard/customers');
    return { message: 'Deleted customer.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete customer.' };
  }
}

// Season Schema and Actions
const SeasonSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Season name cannot be empty'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['active', 'inactive'], {
    invalid_type_error: 'Please select a status.',
  }),
});

const CreateSeason = SeasonSchema.omit({ id: true });
const UpdateSeason = SeasonSchema.omit({ id: true });

export type SeasonState = {
  errors?: {
    name?: string[];
    start_date?: string[];
    end_date?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createSeason(prevState: SeasonState, formData: FormData) {
  const validatedFields = CreateSeason.safeParse({
    name: formData.get('name'),
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Season.',
    };
  }

  const { name, start_date, end_date, status } = validatedFields.data;

  try {
    await sql`
      INSERT INTO seasons (name, start_date, end_date, status)
      VALUES (${name}, ${start_date}, ${end_date}, ${status})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Season.',
    };
  }

  revalidatePath('/dashboard/seasons');
  redirect('/dashboard/seasons');
}

export async function updateSeason(
  id: string,
  prevState: SeasonState,
  formData: FormData
) {
  const validatedFields = UpdateSeason.safeParse({
    name: formData.get('name'),
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Season.',
    };
  }

  const { name, start_date, end_date, status } = validatedFields.data;

  try {
    await sql`
      UPDATE seasons
      SET name = ${name}, start_date = ${start_date}, end_date = ${end_date}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Season.',
    };
  }

  revalidatePath('/dashboard/seasons');
  redirect('/dashboard/seasons');
}

export async function deleteSeason(id: string) {
  try {
    await sql`DELETE FROM seasons WHERE id = ${id}`;
    revalidatePath('/dashboard/seasons');
    return { message: 'Deleted Season.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Season.' };
  }
}
