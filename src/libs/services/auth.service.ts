import { UserDetail } from "@/types/user";
import { supabase } from "../apis/client";
import type { LoginDTO } from "@/types/auth";

export const authService = {
  // Đăng nhập
  login: async (credentials: LoginDTO) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const supabaseUser = data.user;

    const user: UserDetail = {
      id: supabaseUser.id,
      name:
        supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.email?.split("@")[0] ||
        "Người dùng",
      email: supabaseUser.email || "",
      avatar: supabaseUser.user_metadata?.avatar_url || "",
    };

    return {
      user,
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  },

  // Lấy profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Đăng xuất
  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },
};
