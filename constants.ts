import { Product, Category } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: '瞌睡小兔玩偶',
    price: 35.00,
    category: Category.PLUSHIES,
    image: 'https://picsum.photos/id/102/500/500',
    images: ['https://picsum.photos/id/102/500/500'],
    description: '一只超级柔软的手工钩织小兔子，最适合抱抱。使用低过敏性婴儿毛线制作。',
    stock: 5,
    tags: ['可爱', '兔子', '睡觉'],
    is_featured: true,
    is_banner: true
  },
  {
    id: '2',
    title: '暖秋渐变围巾',
    price: 45.00,
    category: Category.WEARABLES,
    image: 'https://picsum.photos/id/103/500/500',
    images: ['https://picsum.photos/id/103/500/500'],
    description: '这个冬天不再冷！粗针织法，拥有美丽的秋日落叶渐变色。',
    stock: 12,
    tags: ['保暖', '时尚', '冬天'],
    is_featured: true,
    is_banner: false
  },
  {
    id: '3',
    title: '青蛙口金包',
    price: 18.00,
    category: Category.ACCESSORIES,
    image: 'https://picsum.photos/id/104/500/500',
    images: ['https://picsum.photos/id/104/500/500'],
    description: '把你的零钱交给这只可爱的小青蛙保管吧。金属搭扣开合。',
    stock: 20,
    tags: ['青蛙', '绿色', '小物'],
    is_featured: false,
    is_banner: false
  },
  {
    id: '4',
    title: '向日葵杯垫套装',
    price: 25.00,
    category: Category.DECOR,
    image: 'https://picsum.photos/id/106/500/500',
    images: ['https://picsum.photos/id/106/500/500'],
    description: '用这套向日葵杯垫点亮你的餐桌。耐热棉线材质。',
    stock: 8,
    tags: ['花朵', '家居', '厨房'],
    is_featured: false,
    is_banner: false
  },
  {
    id: '5',
    title: '粗线慵懒开衫',
    price: 85.00,
    category: Category.WEARABLES,
    image: 'https://picsum.photos/id/107/500/500',
    images: ['https://picsum.photos/id/107/500/500'],
    description: '超大廓形，舒适度满分，配有木质纽扣。支持定制颜色。',
    stock: 3,
    tags: ['服饰', '时尚'],
    is_featured: false,
    is_banner: false
  },
  {
    id: '6',
    title: '迷你章鱼钥匙扣',
    price: 12.00,
    category: Category.ACCESSORIES,
    image: 'https://picsum.photos/id/108/500/500',
    images: ['https://picsum.photos/id/108/500/500'],
    description: '挂在钥匙或背包上的小可爱。有多种马卡龙色可选。',
    stock: 50,
    tags: ['钥匙扣', '海洋', '可爱'],
    is_featured: false,
    is_banner: false
  }
];

export const CATEGORIES = [
  '全部',
  '毛绒玩偶',
  '穿戴服饰',
  '可爱配饰',
  '家居装饰',
  '发夹',
  '发绳',
  '手机绳(链)'
];