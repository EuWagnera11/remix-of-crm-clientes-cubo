import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches ALL rows from a Supabase table, bypassing the 1000-row default limit.
 * Uses range-based pagination internally.
 */
export async function fetchAll<T = any>(
  table: string,
  select: string,
  filters?: {
    eq?: Record<string, any>;
    gte?: Record<string, string>;
    lt?: Record<string, string>;
    in_?: Record<string, any[]>;
    not_?: Record<string, { is: any }>;
    order?: { column: string; ascending?: boolean };
  }
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  let allData: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase.from(table as any).select(select);

    if (filters?.eq) {
      for (const [col, val] of Object.entries(filters.eq)) {
        query = query.eq(col, val);
      }
    }
    if (filters?.gte) {
      for (const [col, val] of Object.entries(filters.gte)) {
        query = query.gte(col, val);
      }
    }
    if (filters?.lt) {
      for (const [col, val] of Object.entries(filters.lt)) {
        query = query.lt(col, val);
      }
    }
    if (filters?.in_) {
      for (const [col, val] of Object.entries(filters.in_)) {
        query = query.in(col, val);
      }
    }
    if (filters?.order) {
      query = query.order(filters.order.column, { ascending: filters.order.ascending ?? true });
    }

    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
    
    if (error) {
      console.error(`fetchAll error on ${table}:`, error.message);
      break;
    }

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
