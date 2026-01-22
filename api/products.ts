
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const { method } = req;

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
