
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Missing Supabase environment variables.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { method } = req;

    // Role check matches products API
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        const authHeader = req.headers.authorization;
        const adminPass = process.env.ADMIN_PASSWORD || 'spencer';
        if (authHeader !== adminPass) {
            return res.status(401).json({ error: 'Unauthorized: Admin role required.' });
        }
    }

    try {
        switch (method) {
            case 'GET':
                const { data: categories, error: getError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name', { ascending: true });

                if (getError) throw getError;
                return res.status(200).json(categories);

            case 'POST':
                const { data: newCat, error: postError } = await supabase
                    .from('categories')
                    .insert([req.body])
                    .select();

                if (postError) throw postError;
                return res.status(201).json(newCat[0]);

            case 'PUT':
                const { id: updateId, ...updates } = req.body;
                const { data: updatedCat, error: putError } = await supabase
                    .from('categories')
                    .update(updates)
                    .eq('id', updateId)
                    .select();

                if (putError) throw putError;
                return res.status(200).json(updatedCat[0]);

            case 'DELETE':
                const { id } = req.query;
                const { error: delError } = await supabase
                    .from('categories')
                    .delete()
                    .eq('id', id);

                if (delError) throw delError;
                return res.status(200).json({ message: 'Deleted successfully' });

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
