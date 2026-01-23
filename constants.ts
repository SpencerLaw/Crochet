import { Product, Category } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: '瞌睡小兔挂件',
    price: 35.00,
    category: Category.PENDANTS,
    image: 'https://picsum.photos/id/102/500/500',
    images: ['https://picsum.photos/id/102/500/500'],
    description: '一只超级柔软的手工钩织小兔子。使用低过敏性婴儿毛线制作。',
    stock: 5,
    tags: [],
    is_featured: true,
    is_banner: true
  },
  {
    id: '2',
    title: '暖秋渐变发箍',
    price: 45.00,
    category: Category.HEADBANDS,
    image: 'https://picsum.photos/id/103/500/500',
    images: ['https://picsum.photos/id/103/500/500'],
    description: '这个冬天不再冷！粗针织法，拥有美丽的秋日落叶渐变色。',
    stock: 12,
    tags: [],
    is_featured: true,
    is_banner: false
  },
  {
    id: '3',
    title: '青蛙包包',
    price: 18.00,
    category: Category.BAGS,
    image: 'https://picsum.photos/id/104/500/500',
    images: ['https://picsum.photos/id/104/500/500'],
    description: '把你的零钱交给这只可爱的小青蛙保管吧。金属搭扣开合。',
    stock: 20,
    tags: [],
    is_featured: false,
    is_banner: false
  },
  {
    id: '4',
    title: '向日葵车载摆件',
    price: 25.00,
    category: Category.DECOR_MIXED,
    image: 'https://picsum.photos/id/106/500/500',
    images: ['https://picsum.photos/id/106/500/500'],
    description: '点亮你的出行时光。耐热棉线材质。',
    stock: 8,
    tags: [],
    is_featured: false,
    is_banner: false
  },
  {
    id: '5',
    title: '猫咪宠物围脖',
    price: 85.00,
    category: Category.PETS,
    image: 'https://picsum.photos/id/107/500/500',
    images: ['https://picsum.photos/id/107/500/500'],
    description: '舒适度满分，配有木质纽扣。支持定制颜色。',
    stock: 3,
    tags: [],
    is_featured: false,
    is_banner: false
  },
  {
    id: '6',
    title: '迷你章鱼挂件',
    price: 12.00,
    category: Category.PENDANTS,
    image: 'https://picsum.photos/id/108/500/500',
    images: ['https://picsum.photos/id/108/500/500'],
    description: '挂在钥匙或背包上的小可爱。有多种马卡龙色可选。',
    stock: 50,
    tags: [],
    is_featured: false,
    is_banner: false
  }
];

export const CATEGORIES = [
  '全部',
  '挂件',
  '挂件、摆件、车载',
  '包包',
  '发箍',
  '宠物（帽子、围脖）',
  '发夹',
  '发绳',
  '手机绳(链)'
];