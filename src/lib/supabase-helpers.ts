import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches all rows from a Supabase query, bypassing the 1000-row default limit.
 * Uses pagination with range() to fetch in batches of 1000.
 */
export async function fetchAllRows<T = any>(
  tableName: string,
  selectColumns: string,
  filters?: { column: string; value: string }[],
  orderBy?: { column: string; ascending?: boolean }
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  let allData: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    let q = supabase.from(tableName).select(selectColumns).range(from, from + PAGE_SIZE - 1);
    
    if (filters) {
      for (const f of filters) {
        q = q.eq(f.column, f.value);
      }
    }
    
    if (orderBy) {
      q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    }

    const { data, error } = await q;
    if (error) throw error;
    
    const rows = (data || []) as T[];
    allData = allData.concat(rows);
    
    if (rows.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      from += PAGE_SIZE;
    }
  }

  return allData;
}
