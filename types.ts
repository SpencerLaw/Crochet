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
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum Category {
  ALL = '全部',
  PLUSHIES = '毛绒玩偶',
  WEARABLES = '穿戴服饰',
  ACCESSORIES = '可爱配饰',
  DECOR = '家居装饰'
}
