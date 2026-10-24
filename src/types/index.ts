export type ProductStatus = 'active' | 'inactive';
export type OrderStatus = 'Pendente de confirmação' | 'Confirmado' | 'Em produção' | 'Pronto' | 'Entregue' | 'Cancelado';
export type PaymentStatus = 'Pendente' | 'Parcialmente pago' | 'Pago' | 'Reembolsado';
export type InventoryUnit = 'g' | 'kg' | 'ml' | 'l' | 'un';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  unit: string;
  status: ProductStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  totalPurchased: number;
  lastPurchaseAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  deliveryDate: string;
  items: OrderItem[];
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: InventoryUnit;
  quantity: number;
  minimumStock: number;
  unitCost: number;
  supplier?: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  date: string;
  reason: string;
  user: string;
}

export interface BusinessSettings {
  companyName: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  logoUrl?: string;
  firstDayOfWeek: number;
}

export interface DashboardSummary {
  revenue: number;
  received: number;
  expenses: number;
  estimatedResult: number;
  ordersReceived: number;
  ongoingOrders: number;
  overdueOrders: number;
  upcomingDeliveries: number;
  topProducts: { name: string; sales: number }[];
  lowStock: { name: string; quantity: number; minimumStock: number }[];
}
