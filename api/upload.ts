
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Keys');
    return res.status(500).json({
      error: 'Server Misconfiguration',
      message: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.',
      debug_url: !!supabaseUrl,
      debug_key: !!supabaseKey
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Role check
  const authHeader = req.headers.authorization;
  const adminPass = process.env.ADMIN_PASSWORD || 'spencer';
  if (authHeader !== adminPass) {
    return res.status(401).json({ error: 'Unauthorized: Admin role required.' });
  }

  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Bad Request', message: 'Request body is empty' });
    }

    const { image, fileName, contentType } = req.body;

    if (!image || !fileName) {
      return res.status(400).json({ error: 'Validation Error', message: 'Missing image or fileName in request body' });
    }

    // Normalize Base64
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
    const buffer = Buffer.from(base64Data, 'base64');

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: contentType || 'image/webp',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      return res.status(500).json({
        error: 'Storage Failure',
        message: error.message || 'Unknown storage error',
        details: error
      });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return res.status(200).json({ url: publicUrl });

  } catch (error: any) {
    console.error('Handler Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
