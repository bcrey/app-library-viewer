import { getSupabase } from "./supabase";
import { AppLink } from "@/types";

interface DbRow {
  id: string;
  url: string;
  title: string;
  icon_url: string;
  custom_icon: boolean;
  sort_order: number;
  created_at: string;
}

function toAppLink(row: DbRow): AppLink {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    iconUrl: row.icon_url,
    customIcon: row.custom_icon,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

class SupabaseAppService {
  async getLinks(): Promise<AppLink[]> {
    const { data, error } = await getSupabase()
      .from("app_links")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data as DbRow[]).map(toAppLink);
  }

  async addLink(
    input: Pick<AppLink, "url" | "title" | "iconUrl">
  ): Promise<AppLink> {
    // Get max sort_order
    const { data: existing } = await getSupabase()
      .from("app_links")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);

    const maxOrder = existing?.[0]?.sort_order ?? 0;

    const { data, error } = await getSupabase()
      .from("app_links")
      .insert({
        url: input.url,
        title: input.title,
        icon_url: input.iconUrl,
        custom_icon: false,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();

    if (error) throw error;
    return toAppLink(data as DbRow);
  }

  async updateLink(
    id: string,
    updates: Partial<Pick<AppLink, "title" | "iconUrl" | "customIcon">>
  ): Promise<AppLink> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.iconUrl !== undefined) dbUpdates.icon_url = updates.iconUrl;
    if (updates.customIcon !== undefined) dbUpdates.custom_icon = updates.customIcon;

    const { data, error } = await getSupabase()
      .from("app_links")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toAppLink(data as DbRow);
  }

  async deleteLink(id: string): Promise<void> {
    const { error } = await getSupabase()
      .from("app_links")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const appService = new SupabaseAppService();
