
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase environment variables.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  if (req.method !== 'POST') return res.status(405).end();

  // Role check
  const authHeader = req.headers.authorization;
  const adminPass = process.env.ADMIN_PASSWORD || 'spencer';
  if (authHeader !== adminPass) {
    return res.status(401).json({ error: 'Unauthorized: Admin role required.' });
  }

  try {
    const { image, fileName, contentType } = req.body; // Base64 image from client
    
    // 将 Base64 转换为 Buffer
    const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    // 上传到 Supabase Storage (设置缓存控制)
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(`public/${fileName}`, buffer, {
        contentType: contentType,
        cacheControl: '31536000', // 1 year cache
        upsert: true
      });

    if (error) throw error;

    // 获取公开 URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(`public/${fileName}`);

    return res.status(200).json({ url: publicUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
