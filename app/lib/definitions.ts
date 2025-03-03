// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
import { JWTPayload } from "jose";
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

export interface SessionPayload extends JWTPayload{
  userId: string;
  // email: string;
  role: string;
  expiresAt: Date;
}

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: "pending" | "paid";
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  phone_number: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: "pending" | "paid";
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  total_invoices: number;

  total_paid: number;
};

export type UserTable = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin"|"user"|"accountant";
}

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type FarmerField = {
  id: string;
  name: string;
};

export type ProductField = {
  id: string;
  name: string;
};

export type LeaderField = {
  id: string;
  name: string;
};

export type SupervisorField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: "pending" | "paid";
};

export type FarmerForm = {
  id: string;
  name: string;
  id_number: string;
  phone_number: string;
  city: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  team_leader_id: string;
  area: number;
};

export type CustomerForm = {
  id: string;
  name: string;
  email: string;
  // image_url: string;
};

export type FarmersTableType = {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  id_number: string;
  city: string;
  district: string;
  sector: string;
  village: string;
  cell: string;
  team_leader_id: string;
  field_supervisor: string;
  area: number;
};

export type LeadersTableType = {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  id_number: string;
  city: string;
  district: string;
  sector: string;
  village: string;
  cell: string;
  supervisor_id: string;
};

export type LeadersTable = {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  id_number: string;
  city: string;
  district: string;
  sector: string;
  village: string;
  cell: string;
  supervisor_id: string;
  supervisor: string;
};

export type GoodsTableType = {
  id: string;
  product: string;
  supplier: string;
  quantity: number;
  date: string;
};

export type GoodsForm = {
  id: string;
  product: string;
  supplier: string;
  quantity: number;
  date: string;
};

export type SalesForm = {
  id: string;
  product: string;
  customer: string;
  quantity: number;
  date: string;
};

export type SalesTableType = {
  id: string;
  product: string;
  customer: string;
  quantity: number;
  date: string;
};

export type ProductsTableType = {
  id: string;
  name: string;
  purchase_unit_price: number;
  sale_unit_price: number;
  unit: string;
};

export type SupervisorsTableType = {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  id_number: string;
  city: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
};
