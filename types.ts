export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  tags: string[];
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
