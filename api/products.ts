
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel settings.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { method } = req;

  // Role check for sensitive operations
  if (method === 'POST' || method === 'DELETE') {
    const authHeader = req.headers.authorization;
    const adminPass = process.env.ADMIN_PASSWORD || 'spencer';
    if (authHeader !== adminPass) {
      return res.status(401).json({ error: 'Unauthorized: Admin role required.' });
    }
  }

  try {
    switch (method) {
      case 'GET':
        const { type, category } = req.query;
        let query = supabase.from('products').select('*');
        
        if (type === 'banner') {
          query = query.eq('is_banner', true);
        } else if (type === 'featured') {
          query = query.eq('is_featured', true);
        }
        
        if (category && category !== '全部') {
          query = query.eq('category', category);
        }

        const { data: products, error: getError } = await query.order('created_at', { ascending: false });
        
        if (getError) throw getError;
        return res.status(200).json(products);

      case 'POST':
        const { data: newProduct, error: postError } = await supabase
          .from('products')
          .insert([req.body])
          .select();
        
        if (postError) throw postError;
        return res.status(201).json(newProduct[0]);

      case 'DELETE':
        const { id } = req.query;
        const { error: delError } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (delError) throw delError;
        return res.status(200).json({ message: 'Deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
