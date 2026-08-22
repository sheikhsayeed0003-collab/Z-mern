export type Role = "user" | "admin";

export type ShippingAddress = {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city?: string;
  isDefault?: boolean;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: Role;
  shippingAddresses: ShippingAddress[];
  createdAt?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category | string;
  image: string;
  stock: number;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  isPopular?: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
};

export type Order = {
  _id: string;
  items: {
    product: string;
    name: string;
    image: string;
    price: number;
    qty: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: string;
  user?: User | string;
};

export function productPrice(product: Product) {
  if (product.isFlashSale && product.flashSalePrice != null) {
    return product.flashSalePrice;
  }
  return product.price;
}
