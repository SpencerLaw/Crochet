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

export interface CartItem extends Product {
  quantity: number;
}

export enum Category {
  ALL = '全部',
  PENDANTS = '挂件',
  ORNAMENTS_CAR_POTTED = '摆件、车载（盆栽）',
  DECOR_MIXED = '挂件、摆件、车载',
  BAGS = '包包',
  HEADBANDS = '发箍',
  PETS = '宠物（帽子、围脖）',
  HAIR_CLIP = '发夹',
  HAIR_TIE = '发绳',
  PHONE_STRAP = '手机小挂件'
}
