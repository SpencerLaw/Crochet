
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
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
    
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
    const buffer = Buffer.from(base64Data, 'base64');

    // 简化上传路径，直接使用文件名，并增加详细错误捕捉
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: contentType || 'image/webp',
        cacheControl: '31536000',
        upsert: true
      });

    if (error) {
      console.error('Supabase Detail Error:', error);
      return res.status(500).json({ 
        error: 'Storage Failure', 
        message: error.message,
        details: error 
      });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return res.status(200).json({ url: publicUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
