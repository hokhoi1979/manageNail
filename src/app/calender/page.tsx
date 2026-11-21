"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Phone,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  LayoutGrid,
  List,
  Eye,
  Check,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import { useBookingAll } from "@/hooks/useBooking";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface RawBookingItem {
  id: string;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  customer_note?: string;
  service_type: string;
  start_time: string;
  end_time: string;
  total_estimated_price: number;
  status: BookingStatus;
  created_at: string;
  updated_at?: string;
  cancel_reason?: string | null;
  cancelled_by?: string | null;
}

export interface BookingItem {
  id: string;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  customer_note?: string;
  service_title: string;
  service_type: string;
  start_time: string;
  end_time: string;
  date_str: string; // dd/MM/yyyy để hiển thị
  iso_date: string; // YYYY-MM-DD để lọc chính xác theo input[type="date"]
  total_price: number;
  status: BookingStatus;
  created_at: string;
  cancel_reason?: string | null;
  cancelled_by?: string | null;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  pending: {
    label: "Chờ xác nhận",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
    dotClass: "bg-amber-500",
    icon: Clock3,
  },
  confirmed: {
    label: "Đã xác nhận",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    dotClass: "bg-emerald-500",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Đã từ chối / Hủy",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200/80",
    dotClass: "bg-rose-500",
    icon: XCircle,
  },
};

const formatPriceVND = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
};

// Lấy chuỗi YYYY-MM-DD theo múi giờ Việt Nam
const getVietnamIsoDate = (date: Date): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(date);

  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
};

// Hàm chuẩn hóa dữ liệu từ API (ISO string -> HH:mm, dd/MM/yyyy & YYYY-MM-DD theo giờ VN)
const formatBookingFromApi = (raw: RawBookingItem): BookingItem => {
  const startDate = new Date(raw.start_time);
  const endDate = new Date(raw.end_time);

  const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const isValidStart = !isNaN(startDate.getTime());
  const startTimeStr = isValidStart
    ? timeFormatter.format(startDate)
    : raw.start_time;
  const endTimeStr = !isNaN(endDate.getTime())
    ? timeFormatter.format(endDate)
    : raw.end_time;
  const dateStr = isValidStart ? dateFormatter.format(startDate) : "";
  const isoDate = isValidStart ? getVietnamIsoDate(startDate) : "";

  const normalizedNote =
    raw.customer_note && raw.customer_note.trim().toLowerCase() !== "không"
      ? raw.customer_note
      : "";

  return {
    id: raw.id,
    booking_code: raw.booking_code,
    customer_name: raw.customer_name,
    customer_phone: raw.customer_phone,
    customer_note: normalizedNote,
    service_title: raw.service_type,
    service_type: raw.service_type,
    start_time: startTimeStr,
    end_time: endTimeStr,
    date_str: dateStr,
    iso_date: isoDate,
    total_price: raw.total_estimated_price ?? 0,
    status: raw.status,
    created_at: raw.created_at,
    cancel_reason: raw.cancel_reason,
    cancelled_by: raw.cancelled_by,
  };
};

interface CalendarTabProps {
  onShowToast?: (msg: string) => void;
  onPendingCountChange?: (count: number) => void;
}

export default function CalendarTab({
  onShowToast,
  onPendingCountChange,
}: CalendarTabProps) {
  const { data: calenderData, isLoading } = useBookingAll();

  const [localOverrides, setLocalOverrides] = useState<
    Record<string, BookingStatus>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(""); // "" = Tất cả ngày, hoặc "YYYY-MM-DD"
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>(
    "all",
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null,
  );

  // Map dữ liệu thật từ API
  const bookings: BookingItem[] = useMemo(() => {
    const response = calenderData as
      | RawBookingItem[]
      | { data?: RawBookingItem[] }
      | undefined;

    const apiList: RawBookingItem[] = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    return apiList.map((item) => {
      const formatted = formatBookingFromApi(item);
      if (localOverrides[formatted.id]) {
        return { ...formatted, status: localOverrides[formatted.id] };
      }
      return formatted;
    });
  }, [calenderData, localOverrides]);

  // Danh sách sau khi lọc theo ngày (dùng để tính số lượng từng trạng thái trong ngày đó)
  const dateFilteredBookings = useMemo(() => {
    if (!selectedDate) return bookings;
    return bookings.filter((item) => item.iso_date === selectedDate);
  }, [bookings, selectedDate]);

  const stats = useMemo(() => {
    const total = dateFilteredBookings.length;
    const pending = dateFilteredBookings.filter(
      (b) => b.status === "pending",
    ).length;
    const confirmed = dateFilteredBookings.filter(
      (b) => b.status === "confirmed",
    ).length;
    const cancelled = dateFilteredBookings.filter(
      (b) => b.status === "cancelled",
    ).length;
    return { total, pending, confirmed, cancelled };
  }, [dateFilteredBookings]);

  // Đồng bộ tổng số lượng lịch chờ xác nhận lên Header của Home
  useEffect(() => {
    const totalPending = bookings.filter((b) => b.status === "pending").length;
    onPendingCountChange?.(totalPending);
  }, [bookings, onPendingCountChange]);

  const filteredBookings = useMemo(() => {
    return dateFilteredBookings.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = item.customer_name?.toLowerCase().includes(query);
        const matchPhone = item.customer_phone?.includes(query);
        const matchCode = item.booking_code?.toLowerCase().includes(query);
        const matchService = item.service_title?.toLowerCase().includes(query);
        return matchName || matchPhone || matchCode || matchService;
      }
      return true;
    });
  }, [dateFilteredBookings, statusFilter, searchTerm]);

  const handleUpdateStatus = (id: string, newStatus: BookingStatus) => {
    setLocalOverrides((prev) => ({ ...prev, [id]: newStatus }));

    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }

    const label = STATUS_CONFIG[newStatus].label;
    onShowToast?.(`Đã chuyển trạng thái lịch sang "${label}"`);
  };

  //   const todayIso = useMemo(() => getVietnamIsoDate(new Date()), []);

  const displaySelectedDate = useMemo(() => {
    if (!selectedDate) return "Tất cả ngày";
    const [y, m, d] = selectedDate.split("-");
    return `${d}/${m}/${y}`;
  }, [selectedDate]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#eee4df] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-[#8f7d77] uppercase tracking-wider">
              Tổng Lịch
            </p>
            <h3 className="text-lg sm:text-2xl font-bold text-[#342420] mt-0.5 sm:mt-1">
              {stats.total}
            </h3>
            <p className="text-[10px] text-[#9b8982]">{displaySelectedDate}</p>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#fdf2ee] text-[#b97865] flex items-center justify-center shrink-0">
            <CalendarDays size={18} />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#eee4df] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Chờ Xác Nhận
            </p>
            <h3 className="text-lg sm:text-2xl font-bold text-amber-700 mt-0.5 sm:mt-1">
              {stats.pending}
            </h3>
            <p className="text-[10px] text-amber-700/80 font-medium">
              Cần xử lý ngay
            </p>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock3 size={18} />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#eee4df] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Đã Xác Nhận
            </p>
            <h3 className="text-lg sm:text-2xl font-bold text-emerald-700 mt-0.5 sm:mt-1">
              {stats.confirmed}
            </h3>
            <p className="text-[10px] text-emerald-700/80 font-medium">
              Khách sẽ đến
            </p>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#eee4df] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
              Đã Hủy / Từ Chối
            </p>
            <h3 className="text-lg sm:text-2xl font-bold text-rose-700 mt-0.5 sm:mt-1">
              {stats.cancelled}
            </h3>
            <p className="text-[10px] text-rose-700/80">Khách hủy/trùng giờ</p>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle size={18} />
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#ede3dc] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9e8b84]">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên khách, số điện thoại, mã lịch..."
              className="w-full pl-9 pr-8 py-2 bg-[#fbf8f6] border border-[#e5d8d0] rounded-xl text-xs sm:text-sm text-[#342420] placeholder-[#b29f98] focus:bg-white focus:outline-none focus:border-[#a66258]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9e8b84]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Bộ lọc theo ngày + Chuyển đổi chế độ xem */}
          {/* Bộ lọc theo ngày + Chuyển đổi chế độ xem */}
          <div className="flex items-center gap-2 justify-between md:justify-end">
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-0">
              <div className="relative flex items-center bg-[#fbf8f6] border border-[#e5d8d0] rounded-xl px-2.5 py-1.5 text-xs sm:text-sm text-[#342420] focus-within:border-[#a66258] focus-within:bg-white flex-1 sm:flex-initial">
                <Calendar
                  size={14}
                  className="text-[#a66258] mr-1.5 shrink-0"
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs sm:text-sm text-[#342420] cursor-pointer w-full min-w-0"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    title="Xóa lọc ngày"
                    className="ml-1 p-0.5 rounded-full hover:bg-[#ede3dc] text-[#8c7b74] cursor-pointer shrink-0"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const today = getVietnamIsoDate(new Date());
                  setSelectedDate((prev) => (prev === today ? "" : today));
                }}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDate !== ""
                    ? "bg-[#fbf6f3] text-[#4a2d31] border-[#e5d8d0] hover:bg-[#f3e7e1]"
                    : "bg-[#fbf6f3] text-[#4a2d31] border-[#e5d8d0] hover:bg-[#f3e7e1]"
                }`}
              >
                Hôm nay
              </button>
            </div>

            {/* Nút chuyển đổi Dạng bảng / Dạng lưới - Luôn hiển thị trên mọi thiết bị */}
            <div className="flex items-center p-1 bg-[#fbf6f3] rounded-xl border border-[#ede1da] shrink-0">
              <button
                onClick={() => setViewMode("table")}
                title="Dạng bảng"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#4a2d31] shadow-sm"
                    : "text-[#8d7c75] hover:text-[#4a2d31]"
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Dạng lưới"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#4a2d31] shadow-sm"
                    : "text-[#8d7c75] hover:text-[#4a2d31]"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#f4eae4] pt-2 text-xs">
          <span className="hidden sm:inline-block text-[11px] font-semibold text-[#8c7b74] uppercase tracking-wider shrink-0 mr-1">
            Trạng thái:
          </span>

          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#4a2d31] text-white shadow-sm font-semibold"
                : "bg-[#fbf6f3] text-[#6d5c56] hover:bg-[#f3e7e1]"
            }`}
          >
            Tất cả ({dateFilteredBookings.length})
          </button>

          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-sm font-semibold"
                : "bg-amber-50 text-amber-800 border border-amber-200/60"
            }`}
          >
            <span>Chờ xác nhận ({stats.pending})</span>
          </button>

          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "confirmed"
                ? "bg-emerald-600 text-white shadow-sm font-semibold"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
            }`}
          >
            <span>Đã xác nhận ({stats.confirmed})</span>
          </button>

          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "cancelled"
                ? "bg-rose-600 text-white shadow-sm font-semibold"
                : "bg-rose-50 text-rose-800 border border-rose-200/60"
            }`}
          >
            <span>Đã từ chối / Hủy ({stats.cancelled})</span>
          </button>
        </div>
      </div>

      {/* DANH SÁCH LỊCH HẸN */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#ede3dc] p-12 flex flex-col items-center justify-center gap-2 text-sm text-[#8c7b74]">
          <Loader2 size={22} className="animate-spin text-[#a66258]" />
          <span>Đang tải danh sách lịch hẹn...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ede3dc] p-10 text-center space-y-2">
          <p className="text-sm text-[#8c7b74]">
            Không tìm thấy lịch đặt hẹn nào
            {selectedDate ? ` trong ngày ${displaySelectedDate}` : ""}.
          </p>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="text-xs font-semibold text-[#a66258] underline cursor-pointer"
            >
              Xem tất cả các ngày
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-[#ede3dc] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fbf8f6] border-b border-[#ede3dc] text-[11px] uppercase tracking-wider text-[#8c7b74]">
                  <th className="py-3 px-4 font-semibold">Khách hàng</th>
                  <th className="py-3 px-4 font-semibold">Dịch vụ</th>
                  <th className="py-3 px-4 font-semibold">Thời gian</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eae4] text-xs sm:text-sm">
                {filteredBookings.map((item) => {
                  const statusCfg =
                    STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#fdfbfa] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#342420]">
                          {item.customer_name}
                        </div>
                        <div className="text-xs text-[#8c7b74] flex items-center gap-1 mt-0.5">
                          <Phone size={12} />
                          <span>{item.customer_phone}</span>
                          <span className="text-[#c5b5ae]">•</span>
                          <span className="font-mono text-[11px]">
                            {item.booking_code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-[#342420] capitalize line-clamp-1">
                          {item.service_title}
                        </div>
                        {item.customer_note && (
                          <div className="text-[11px] text-[#9b8982] line-clamp-1 mt-0.5">
                            Ghi chú: {item.customer_note}
                          </div>
                        )}
                        {item.status === "cancelled" && item.cancel_reason && (
                          <div className="text-[11px] text-rose-600 line-clamp-1 mt-0.5">
                            Lý do: {item.cancel_reason}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#4a2d31] flex items-center gap-1">
                          <Clock size={13} className="text-[#a66258]" />
                          <span>
                            {item.start_time} - {item.end_time}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8c7b74] mt-0.5">
                          {item.date_str}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
                        >
                          <StatusIcon size={13} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {item.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(item.id, "confirmed")
                                }
                                title="Xác nhận lịch"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(item.id, "cancelled")
                                }
                                title="Từ chối lịch"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedBooking(item)}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg bg-[#f6eee9] text-[#4a2d31] hover:bg-[#4a2d31] hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBookings.map((item) => {
            const statusCfg =
              STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedBooking(item)}
                className="bg-white p-4 rounded-2xl border border-[#ede3dc] shadow-sm flex flex-col justify-between space-y-3 cursor-pointer hover:border-[#d5bfb6] transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#8c7b74]">
                      {item.booking_code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badgeClass}`}
                    >
                      <StatusIcon size={12} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#342420]">
                      {item.customer_name}
                    </h4>
                    <p className="text-xs text-[#8c7b74]">
                      {item.customer_phone}
                    </p>
                  </div>
                  <p className="text-xs font-medium capitalize text-[#4a2d31] bg-[#fbf6f3] p-2.5 rounded-xl">
                    {item.service_title}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#f3eae4] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#4a2d31]">
                    {item.start_time} - {item.end_time} ({item.date_str})
                  </span>
                  <span className="font-bold text-[#a66258]">
                    {formatPriceVND(item.total_price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CHI TIẾT LỊCH HẸN */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-[#ede3dc]">
            <div className="flex items-center justify-between border-b border-[#f3eae4] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#8c7b74]">
                  Mã lịch: {selectedBooking.booking_code}
                </span>
                <h3 className="font-bold text-base text-[#342420]">
                  {selectedBooking.customer_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg hover:bg-[#f6eee9] text-[#8c7b74]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8c7b74]">Số điện thoại:</span>
                <span className="font-semibold">
                  {selectedBooking.customer_phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c7b74]">Thời gian hẹn:</span>
                <span className="font-semibold">
                  {selectedBooking.start_time} - {selectedBooking.end_time} (
                  {selectedBooking.date_str})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c7b74]">Dịch vụ:</span>
                <span className="font-semibold capitalize">
                  {selectedBooking.service_title}
                </span>
              </div>

              {selectedBooking.customer_note && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 text-amber-900 border border-amber-200/60">
                  <strong>Ghi chú khách:</strong>{" "}
                  {selectedBooking.customer_note}
                </div>
              )}

              {selectedBooking.status === "cancelled" &&
                selectedBooking.cancel_reason && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/70">
                    <strong>Lý do hủy:</strong> {selectedBooking.cancel_reason}
                    {selectedBooking.cancelled_by && (
                      <span className="block text-[11px] opacity-80 mt-0.5">
                        Người hủy:{" "}
                        {selectedBooking.cancelled_by === "customer"
                          ? "Khách hàng"
                          : "Salon"}
                      </span>
                    )}
                  </div>
                )}

              <div className="bg-[#fbf8f6] p-3 rounded-xl border border-[#ede3dc] flex justify-between font-bold text-sm text-[#4a2d31]">
                <span>Tổng dự kiến</span>
                <span>{formatPriceVND(selectedBooking.total_price)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3eae4]">
              {selectedBooking.status !== "cancelled" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedBooking.id, "cancelled")
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer"
                >
                  Từ chối lịch
                </button>
              )}
              {selectedBooking.status !== "confirmed" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedBooking.id, "confirmed")
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Xác nhận lịch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
