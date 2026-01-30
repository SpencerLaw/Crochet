export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  description: string;
  stock: number;
  tags: string[];
  is_featured: boolean;
  is_banner: boolean;
  banner_text?: string;
  // New precision attributes
  materials?: string[];
  created_at?: string;
}

export interface CategoryEntity {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
