'use server'

import { supabase } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleRls(tableName: string, enable: boolean) {
    try {
        const query = `ALTER TABLE "${tableName}" ${enable ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY`;
        const { error } = await supabase.rpc('execute_sql', { sql: query });
        
        if (error) {
            throw new Error(error.message);
        }

        revalidatePath('/security');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
