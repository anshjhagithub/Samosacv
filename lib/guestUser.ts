import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function getGuestUserId(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return "00000000-0000-0000-0000-000000000000";
  const admin = createAdminClient(url, key);
  
  try {
    const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (usersData?.users?.length > 0) {
      return usersData.users[0].id;
    }
    const { data: newUser } = await admin.auth.admin.createUser({
      email: "guest@samosacv.com",
      password: "guestpassword123",
      email_confirm: true,
    });
    return newUser.user?.id ?? "00000000-0000-0000-0000-000000000000";
  } catch {
    return "00000000-0000-0000-0000-000000000000";
  }
}
