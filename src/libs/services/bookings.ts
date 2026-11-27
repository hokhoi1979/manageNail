import { supabase } from "../apis/client";
import { endpoints } from "../apis/endpoints";
import { ServiceItem } from "./services";

export type ServiceType = "nail" | "gội đầu" | "nail + gội đầu";

// 1. Khớp chính xác các cột được truyền lên bảng `bookings`
export interface CreateBookingPayload {
  customer_name: string;
  customer_phone: string;
  customer_note?: string | null;
  start_time: string;
  end_time: string;
  total_estimated_price: number;
  service_type: ServiceType;
}

export interface BookingServiceResponse {
  id: string;
  booking_id: string;
  service_id: string;
  price_at_booking: number;
  duration_at_booking: number;
  services: {
    id: string;
    name: string;
  } | null;
}

export interface BookingResponse {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_note: string | null;
  start_time: string;
  end_time: string;
  total_estimated_price: number;
  service_type: ServiceType;
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  cancelled_by: "customer" | "admin" | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;

  // Bổ sung quan hệ dịch vụ
  booking_services: BookingServiceResponse[];
}

// 2. Khớp chính xác các cột trả về từ bảng `bookings`
export interface BookingResponse {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_note: string | null;
  start_time: string;
  end_time: string;
  total_estimated_price: number;
  service_type: ServiceType;
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  cancelled_by: "customer" | "admin" | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const bookingService = {
  // Tra cứu theo ID đơn (vì bảng bookings của bạn hiện không có cột booking_code)
  getById: async (bookingId: string): Promise<BookingResponse> => {
    const { data, error } = await supabase
      .from(endpoints.bookings)
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error) throw error;
    return data;
  },

  // Khách tự hủy đơn pending (theo id)
  cancelByCustomer: async (bookingId: string, cancelReason?: string) => {
    const { error, count } = await supabase
      .from(endpoints.bookings)
      .update(
        {
          status: "cancelled",
          cancelled_by: "customer",
          cancel_reason: cancelReason || null,
        },
        { count: "exact" }, // Đếm số dòng cập nhật thành công mà không cần quyền SELECT lại
      )
      .eq("id", bookingId)
      .eq("status", "pending");

    if (error) throw error;
    if (count === 0) {
      throw new Error(
        "Không thể hủy đơn (Đơn đã được duyệt hoặc không tồn tại).",
      );
    }
    return true;
  },

  // Lấy các khung giờ bận để chặn trùng lịch
  getBusySlots: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from(endpoints.bookings)
      .select("start_time, end_time")
      .in("status", ["pending", "confirmed", "in_progress"])
      .gte("start_time", startDate)
      .lte("end_time", endDate);

    if (error) throw error;
    return data || [];
  },

  getAll: async (): Promise<BookingResponse[]> => {
    const { data, error } = await supabase
      .from(endpoints.bookings)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        [
          `Không thể lấy bookings: ${error.message}`,
          error.code ? `code=${error.code}` : "",
          error.details ? `details=${error.details}` : "",
          error.hint ? `hint=${error.hint}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      );
    }

    return data ?? [];
  },

  confirmBooking: async (bookingId: string) => {
    const { error, count } = await supabase
      .from(endpoints.bookings)
      .update(
        {
          status: "confirmed",
        },
        { count: "exact" },
      )
      .eq("id", bookingId)
      .eq("status", "pending");

    if (error) throw error;
    if (count === 0) {
      throw new Error(
        "Không thể hủy đơn (Đơn đã được duyệt hoặc không tồn tại).",
      );
    }
    return true;
  },

  cancelBooking: async (bookingId: string, cancelReason?: string) => {
    const { error, count } = await supabase
      .from(endpoints.bookings)
      .update(
        {
          status: "cancelled",
          cancelled_by: "admin",
          cancel_reason: cancelReason || null,
        },
        { count: "exact" },
      )
      .eq("id", bookingId)
      .in("status", ["pending", "confirmed"]);
    if (error) throw error;
    if (count === 0) {
      throw new Error(
        "Không thể hủy đơn (Đơn đã được duyệt hoặc không tồn tại).",
      );
    }
    return true;
  },
};
