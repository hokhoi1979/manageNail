import { supabase } from "../apis/client";
import { endpoints } from "../apis/endpoints";

// ==========================================
// 1. TYPES CHO LỊCH LÀM VIỆC & CẤU HÌNH CA
// ==========================================
export interface WeeklyHourItem {
  day_of_week: number; // 0 = Chủ Nhật, 1 = Thứ Hai ... 6 = Thứ Bảy
  day_label: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export interface BookingSettingsItem {
  id: number;
  slot_step_minutes: number;
  max_concurrent_bookings: number;
}

export interface DateOverrideItem {
  override_date: string; // Định dạng YYYY-MM-DD
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  note: string | null;
}

export interface SalonScheduleSetupResponse {
  weekly_hours: WeeklyHourItem[];
  booking_settings: BookingSettingsItem;
  date_overrides: DateOverrideItem[];
}

export interface SaveSalonSchedulePayload {
  weekly_hours?: WeeklyHourItem[];
  booking_settings?: {
    slot_step_minutes: number;
    max_concurrent_bookings: number;
  };
  date_override?: {
    override_date: string;
    is_open: boolean;
    open_time?: string | null;
    close_time?: string | null;
    note?: string | null;
  } | null;
}

// ==========================================
// 2. TYPES CHO MENU DỊCH VỤ
// ==========================================
export type ServiceCategory = "nail" | "gội đầu" | "combo";

export interface SalonServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  price: number;
  duration_minutes: number;
  buffer_minutes: number;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

interface SupabaseErrorLike {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

const formatSupabaseError = (prefix: string, error: SupabaseErrorLike) => {
  return new Error(
    [
      `${prefix}: ${error.message}`,
      error.code ? `code=${error.code}` : "",
      error.details ? `details=${error.details}` : "",
      error.hint ? `hint=${error.hint}` : "",
    ]
      .filter(Boolean)
      .join(" | "),
  );
};

// ==========================================
// 3. SERVICE GỌI API SUPABASE
// ==========================================
export const setupService = {
  // --- PHẦN A: LỊCH LÀM VIỆC (3 BẢNG QUA 1 RPC) ---
  getScheduleSetup: async (): Promise<SalonScheduleSetupResponse> => {
    const { data, error } = await supabase.rpc("get_salon_schedule_setup");
    if (error) {
      throw formatSupabaseError("Không thể tải cấu hình lịch salon", error);
    }
    return data as SalonScheduleSetupResponse;
  },

  saveScheduleSetup: async (
    payload: SaveSalonSchedulePayload,
  ): Promise<SalonScheduleSetupResponse> => {
    const { data, error } = await supabase.rpc("save_salon_schedule_setup", {
      p_weekly_hours: payload.weekly_hours ?? null,
      p_booking_settings: payload.booking_settings ?? null,
      p_date_override: payload.date_override ?? null,
    });
    if (error) {
      throw formatSupabaseError("Không thể lưu cấu hình lịch salon", error);
    }
    return data as SalonScheduleSetupResponse;
  },

  deleteDateOverride: async (overrideDate: string): Promise<boolean> => {
    const { error, count } = await supabase
      .from("salon_date_overrides")
      .delete({ count: "exact" })
      .eq("override_date", overrideDate);

    if (error) {
      throw formatSupabaseError("Không thể xóa ngày ngoại lệ", error);
    }
    if (count === 0) {
      throw new Error("Ngày ngoại lệ không tồn tại hoặc đã được xóa.");
    }
    return true;
  },

  getEffectiveHoursForDate: async (dateStr: string) => {
    const setup = await setupService.getScheduleSetup();

    const override = setup.date_overrides.find(
      (item) => item.override_date === dateStr,
    );
    if (override) {
      return {
        is_open: override.is_open,
        open_time: override.open_time,
        close_time: override.close_time,
        note: override.note,
        slot_step_minutes: setup.booking_settings.slot_step_minutes,
        max_concurrent_bookings: setup.booking_settings.max_concurrent_bookings,
        source: "override" as const,
      };
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    const weekly = setup.weekly_hours.find(
      (item) => item.day_of_week === dayOfWeek,
    );

    return {
      is_open: weekly?.is_open ?? false,
      open_time: weekly?.open_time ?? null,
      close_time: weekly?.close_time ?? null,
      note: null,
      slot_step_minutes: setup.booking_settings.slot_step_minutes,
      max_concurrent_bookings: setup.booking_settings.max_concurrent_bookings,
      source: "weekly" as const,
    };
  },

  // --- PHẦN B: MENU DỊCH VỤ & UPLOAD ẢNH ---
  getAllServices: async (): Promise<SalonServiceItem[]> => {
    const { data, error } = await supabase
      .from(endpoints.services)
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      throw formatSupabaseError("Không thể tải danh sách dịch vụ", error);
    }
    return data ?? [];
  },

  uploadServiceImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `services/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("service-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw formatSupabaseError("Không thể tải ảnh dịch vụ lên", uploadError);
    }

    const { data } = supabase.storage
      .from("service-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  createService: async (
    payload: Partial<SalonServiceItem>,
  ): Promise<SalonServiceItem> => {
    const { data, error } = await supabase
      .from(endpoints.services)
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw formatSupabaseError("Không thể thêm dịch vụ mới", error);
    }
    return data;
  },

  updateService: async (
    id: string,
    payload: Partial<SalonServiceItem>,
  ): Promise<SalonServiceItem> => {
    const { data, error } = await supabase
      .from(endpoints.services)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw formatSupabaseError("Không thể cập nhật dịch vụ", error);
    }
    return data;
  },

  deleteService: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from(endpoints.services)
      .delete()
      .eq("id", id);

    if (error) {
      throw formatSupabaseError("Không thể xóa dịch vụ", error);
    }
    return true;
  },
};
