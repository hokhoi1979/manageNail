"use client";

import React, { useState } from "react";
import {
  Calendar,
  Scissors,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  CalendarOff,
  Loader2,
} from "lucide-react";
import {
  useScheduleSetup,
  useSaveScheduleSetup,
  useDeleteDateOverride,
  useSetupServices,
  useCreateSetupService,
  useUpdateSetupService,
  useDeleteSetupService,
} from "@/hooks/useSetup";
import {
  WeeklyHourItem,
  BookingSettingsItem,
  SalonServiceItem,
  ServiceCategory,
  setupService,
} from "@/libs/services/setup";

const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80";

const formatPriceVND = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Cắt "08:30:00" -> "08:30" để hiển thị chuẩn trên <input type="time" />
const toInputTime = (timeStr?: string | null) =>
  timeStr ? timeStr.slice(0, 5) : "08:30";

// Chuẩn hóa "08:30" -> "08:30:00" khớp kiểu TIME Postgres
const toPostgresTime = (timeStr?: string | null) => {
  if (!timeStr) return null;
  return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
};

interface SetupTabProps {
  onShowToast?: (msg: string) => void;
}

export default function SetupTab({ onShowToast }: SetupTabProps) {
  const [setupSubTab, setSetupSubTab] = useState<"schedule" | "services">(
    "schedule",
  );

  // ==========================================
  // 1. HOOKS & STATE LỊCH LÀM VIỆC
  // ==========================================
  const { data: setupData, isLoading: isLoadingSchedule } = useScheduleSetup();
  const { mutate: saveSchedule, isPending: isSavingSchedule } =
    useSaveScheduleSetup();
  const { mutate: deleteOverride, isPending: isDeletingOverride } =
    useDeleteDateOverride();

  // State lưu bản nháp đang chỉnh sửa (null = chưa sửa, dùng thẳng data từ server)
  const [draftWeeklyHours, setDraftWeeklyHours] = useState<
    WeeklyHourItem[] | null
  >(null);
  const [draftBookingSettings, setDraftBookingSettings] =
    useState<BookingSettingsItem | null>(null);

  const weeklyHours: WeeklyHourItem[] =
    draftWeeklyHours ??
    (setupData?.weekly_hours ?? []).map((item) => ({
      ...item,
      open_time: toInputTime(item.open_time),
      close_time: toInputTime(item.close_time),
    }));

  const bookingSettings: BookingSettingsItem = draftBookingSettings ??
    setupData?.booking_settings ?? {
      id: 1,
      slot_step_minutes: 45,
      max_concurrent_bookings: 2,
    };

  // State form thêm nhanh date_overrides
  const [overrideDate, setOverrideDate] = useState<string>("");
  const [overrideIsOpen, setOverrideIsOpen] = useState<boolean>(false);
  const [overrideOpenTime, setOverrideOpenTime] = useState<string>("09:00");
  const [overrideCloseTime, setOverrideCloseTime] = useState<string>("18:00");
  const [overrideNote, setOverrideNote] = useState<string>("");

  // ==========================================
  // 2. HOOKS & STATE MENU DỊCH VỤ
  // ==========================================
  const { data: services = [], isLoading: isLoadingServices } =
    useSetupServices();
  const { mutate: createService, isPending: isCreatingService } =
    useCreateSetupService();
  const { mutate: updateService, isPending: isUpdatingService } =
    useUpdateSetupService();
  const { mutate: deleteService } = useDeleteSetupService();

  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] =
    useState<ServiceCategory>("nail");
  const [servicePrice, setServicePrice] = useState<number>(250000);
  const [serviceDuration, setServiceDuration] = useState<number>(45);
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceImageUrl, setServiceImageUrl] = useState(DEFAULT_SERVICE_IMAGE);

  // Handlers Lịch làm việc
  const handleToggleDay = (day_of_week: number) => {
    setDraftWeeklyHours(
      weeklyHours.map((d) =>
        d.day_of_week === day_of_week ? { ...d, is_open: !d.is_open } : d,
      ),
    );
  };

  const handleUpdateDayTime = (
    day_of_week: number,
    field: "open_time" | "close_time",
    value: string,
  ) => {
    setDraftWeeklyHours(
      weeklyHours.map((d) =>
        d.day_of_week === day_of_week ? { ...d, [field]: value } : d,
      ),
    );
  };

  const handleAddDateOverride = () => {
    if (!overrideDate) {
      alert("Vui lòng chọn ngày đặc biệt / ngày nghỉ!");
      return;
    }

    saveSchedule(
      {
        date_override: {
          override_date: overrideDate,
          is_open: overrideIsOpen,
          open_time: overrideIsOpen ? toPostgresTime(overrideOpenTime) : null,
          close_time: overrideIsOpen ? toPostgresTime(overrideCloseTime) : null,
          note: overrideNote.trim() ? overrideNote.trim() : null,
        },
      },
      {
        onSuccess: () => {
          setOverrideDate("");
          setOverrideNote("");
          onShowToast?.("Đã lưu ngày ngoại lệ lên hệ thống!");
        },
      },
    );
  };

  const handleRemoveDateOverride = (date: string) => {
    deleteOverride(date, {
      onSuccess: () => {
        onShowToast?.("Đã xóa ngày ngoại lệ!");
      },
    });
  };

  const handleSaveSchedule = () => {
    saveSchedule(
      {
        weekly_hours: weeklyHours.map((item) => ({
          day_of_week: item.day_of_week,
          day_label: item.day_label,
          is_open: item.is_open,
          open_time: toPostgresTime(item.open_time) || "08:30:00",
          close_time: toPostgresTime(item.close_time) || "20:30:00",
        })),
        booking_settings: {
          slot_step_minutes: bookingSettings.slot_step_minutes,
          max_concurrent_bookings: bookingSettings.max_concurrent_bookings,
        },
      },
      {
        onSuccess: () => {
          setDraftWeeklyHours(null);
          setDraftBookingSettings(null);
          onShowToast?.("Đã lưu cấu hình lịch làm việc!");
        },
      },
    );
  };

  // Handlers Dịch vụ
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const publicUrl = await setupService.uploadServiceImage(file);
      setServiceImageUrl(publicUrl);
      onShowToast?.("Đã tải ảnh lên Supabase thành công!");
    } catch (error) {
      console.error("Upload ảnh thất bại:", error);
      alert("Không thể tải ảnh lên. Vui lòng kiểm tra lại quyền bucket!");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      alert("Vui lòng nhập tên dịch vụ!");
      return;
    }

    const payload = {
      name: serviceName.trim(),
      category: serviceCategory,
      price: Number(servicePrice),
      duration_minutes: Number(serviceDuration),
      image_url: serviceImageUrl,
      description: serviceDescription.trim() || null,
    };

    if (editingServiceId) {
      updateService(
        { id: editingServiceId, payload },
        {
          onSuccess: () => {
            setIsServiceFormOpen(false);
            setEditingServiceId(null);
            onShowToast?.("Cập nhật dịch vụ thành công!");
          },
        },
      );
    } else {
      createService(
        {
          ...payload,
          buffer_minutes: 15,
          display_order: services.length + 1,
          is_active: true,
        },
        {
          onSuccess: () => {
            setIsServiceFormOpen(false);
            setServiceName("");
            setServicePrice(250000);
            setServiceDuration(45);
            setServiceDescription("");
            onShowToast?.("Thêm dịch vụ mới thành công!");
          },
        },
      );
    }
  };

  const handleOpenEditService = (service: SalonServiceItem) => {
    setEditingServiceId(service.id);
    setServiceName(service.name);
    setServiceCategory(service.category || "nail");
    setServicePrice(service.price);
    setServiceDuration(service.duration_minutes);
    setServiceImageUrl(service.image_url || DEFAULT_SERVICE_IMAGE);
    setServiceDescription(service.description || "");
    setIsServiceFormOpen(true);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dịch vụ này khỏi menu salon?")) {
      deleteService(id, {
        onSuccess: () => {
          onShowToast?.("Đã xóa dịch vụ!");
        },
      });
    }
  };

  const handleToggleServiceActive = (service: SalonServiceItem) => {
    updateService(
      {
        id: service.id,
        payload: { is_active: !service.is_active },
      },
      {
        onSuccess: () => {
          onShowToast?.(
            !service.is_active ? "Đã bật hiển thị dịch vụ!" : "Đã ẩn dịch vụ!",
          );
        },
      },
    );
  };

  const dateOverrides = setupData?.date_overrides ?? [];
  const isSubmittingService = isCreatingService || isUpdatingService;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Sub-navigation Setup */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#ede3dc] shadow-sm w-fit">
        <button
          onClick={() => setSetupSubTab("schedule")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            setupSubTab === "schedule"
              ? "bg-[#4a2d31] text-white shadow-sm"
              : "text-[#7d6c65] hover:bg-[#fbf6f3]"
          }`}
        >
          <Calendar size={16} />
          <span>Khung giờ làm việc</span>
        </button>

        <button
          onClick={() => setSetupSubTab("services")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            setupSubTab === "services"
              ? "bg-[#4a2d31] text-white shadow-sm"
              : "text-[#7d6c65] hover:bg-[#fbf6f3]"
          }`}
        >
          <Scissors size={16} />
          <span>Menu Dịch vụ ({services.length})</span>
        </button>
      </div>

      {/* TAB 1: KHUNG GIỜ LÀM VIỆC */}
      {setupSubTab === "schedule" && (
        <>
          {isLoadingSchedule ? (
            <div className="bg-white p-12 rounded-2xl border border-[#ede3dc] flex items-center justify-center gap-2 text-sm text-[#7d6c65]">
              <Loader2 size={18} className="animate-spin text-[#4a2d31]" />
              <span>Đang tải cấu hình lịch làm việc...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* CỘT TRÁI: WEEKLY HOURS */}
              <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-[#ede3dc] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#f3eae4] pb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#342420]">
                      Lịch mở cửa trong tuần
                    </h3>
                    <p className="text-xs text-[#8c7b74]">
                      Bật/tắt các ngày nhận khách đặt lịch trên website
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSavingSchedule}
                    onClick={handleSaveSchedule}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4a2d31] text-white text-xs font-semibold hover:bg-[#5f363b] disabled:opacity-60 cursor-pointer"
                  >
                    {isSavingSchedule && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    <span>
                      {isSavingSchedule ? "Đang lưu..." : "Lưu thay đổi"}
                    </span>
                  </button>
                </div>

                <div className="divide-y divide-[#f3eae4]">
                  {weeklyHours.map((day) => (
                    <div
                      key={day.day_of_week}
                      className="py-3 flex flex-wrap items-center justify-between gap-3"
                    >
                      <label className="flex items-center gap-3 cursor-pointer min-w-[130px]">
                        <input
                          type="checkbox"
                          checked={day.is_open}
                          onChange={() => handleToggleDay(day.day_of_week)}
                          className="w-4 h-4 accent-[#4a2d31] rounded cursor-pointer"
                        />
                        <span
                          className={`text-sm font-semibold ${
                            day.is_open
                              ? "text-[#342420]"
                              : "text-[#a69690] line-through"
                          }`}
                        >
                          {day.day_label}
                        </span>
                      </label>

                      {day.is_open ? (
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="time"
                            value={day.open_time}
                            onChange={(e) =>
                              handleUpdateDayTime(
                                day.day_of_week,
                                "open_time",
                                e.target.value,
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-[#e5d8d0] bg-[#fbf8f6]"
                          />
                          <span className="text-[#8c7b74]">đến</span>
                          <input
                            type="time"
                            value={day.close_time}
                            onChange={(e) =>
                              handleUpdateDayTime(
                                day.day_of_week,
                                "close_time",
                                e.target.value,
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-[#e5d8d0] bg-[#fbf8f6]"
                          />
                        </div>
                      ) : (
                        <span className="text-xs italic text-[#a69690]">
                          Nghỉ định kỳ
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CỘT PHẢI: BOOKING SETTINGS & DATE OVERRIDES */}
              <div className="space-y-4">
                {/* Booking Settings */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#ede3dc] shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-[#342420] border-b border-[#f3eae4] pb-3">
                    Cấu hình ca đặt lịch
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <label className="block font-semibold text-[#4a2d31] mb-1">
                        Bước nhảy khung giờ (phút)
                      </label>
                      <select
                        value={bookingSettings.slot_step_minutes}
                        onChange={(e) =>
                          setDraftBookingSettings({
                            ...bookingSettings,
                            slot_step_minutes: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                      >
                        <option value={30}>30 phút / khung giờ</option>
                        <option value={45}>45 phút / khung giờ</option>
                        <option value={60}>60 phút / khung giờ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#4a2d31] mb-1">
                        Số khách tối đa cùng lúc
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={bookingSettings.max_concurrent_bookings}
                        onChange={(e) =>
                          setDraftBookingSettings({
                            ...bookingSettings,
                            max_concurrent_bookings: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                      />
                      <p className="text-[11px] text-[#8c7b74] mt-1">
                        Phù hợp với số lượng ghế/nhân sự hiện tại của salon.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date Overrides */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#ede3dc] shadow-sm space-y-3.5">
                  <div className="border-b border-[#f3eae4] pb-2.5">
                    <h3 className="font-bold text-base text-[#342420] flex items-center gap-1.5">
                      <CalendarOff size={16} className="text-[#a66258]" />
                      <span>Ngày nghỉ / Giờ đặc biệt</span>
                    </h3>
                    <p className="text-[11px] text-[#8c7b74] mt-0.5">
                      Ghi đè lịch mở cửa cho ngày lễ hoặc sự kiện riêng
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block font-semibold text-[#4a2d31] mb-1">
                        Chọn ngày
                      </label>
                      <input
                        type="date"
                        value={overrideDate}
                        onChange={(e) => setOverrideDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={overrideIsOpen}
                        onChange={(e) => setOverrideIsOpen(e.target.checked)}
                        className="w-4 h-4 accent-[#4a2d31] rounded cursor-pointer"
                      />
                      <span className="font-medium text-[#342420]">
                        Vẫn mở cửa (đổi khung giờ khác)
                      </span>
                    </label>

                    {overrideIsOpen && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={overrideOpenTime}
                          onChange={(e) => setOverrideOpenTime(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#e5d8d0] bg-[#fbf8f6]"
                        />
                        <span className="text-[#8c7b74]">đến</span>
                        <input
                          type="time"
                          value={overrideCloseTime}
                          onChange={(e) => setOverrideCloseTime(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#e5d8d0] bg-[#fbf8f6]"
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      placeholder="Ghi chú (VD: Nghỉ lễ 30/4, Mở tăng ca...)"
                      className="w-full px-3 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                    />

                    <button
                      type="button"
                      disabled={isSavingSchedule}
                      onClick={handleAddDateOverride}
                      className="w-full py-2 rounded-xl bg-[#fbf6f3] text-[#4a2d31] border border-[#e5d8d0] font-semibold hover:bg-[#f3e7e1] disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      {isSavingSchedule
                        ? "Đang lưu..."
                        : "+ Thêm ngày ngoại lệ"}
                    </button>
                  </div>

                  {dateOverrides.length > 0 && (
                    <div className="pt-2 border-t border-[#f3eae4] space-y-2">
                      {dateOverrides.map((item) => (
                        <div
                          key={item.override_date}
                          className="p-2.5 rounded-xl bg-[#fbf8f6] border border-[#ede3dc] flex items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#342420]">
                              {item.override_date
                                .split("-")
                                .reverse()
                                .join("/")}{" "}
                              <span
                                className={`ml-1 text-[11px] font-semibold ${
                                  item.is_open
                                    ? "text-emerald-700"
                                    : "text-rose-700"
                                }`}
                              >
                                {item.is_open
                                  ? `(${toInputTime(item.open_time)} - ${toInputTime(item.close_time)})`
                                  : "(Nghỉ)"}
                              </span>
                            </div>
                            {item.note && (
                              <p className="text-[11px] text-[#8c7b74]">
                                {item.note}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={isDeletingOverride}
                            onClick={() =>
                              handleRemoveDateOverride(item.override_date)
                            }
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: MENU DỊCH VỤ */}
      {setupSubTab === "services" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#ede3dc] shadow-sm">
            <div>
              <h3 className="font-bold text-base text-[#342420]">
                Danh sách dịch vụ
              </h3>
              <p className="text-xs text-[#8c7b74]">
                Quản lý giá tiền, thời lượng và hình ảnh hiển thị cho khách đặt
              </p>
            </div>
            <button
              onClick={() => {
                setEditingServiceId(null);
                setServiceName("");
                setServiceCategory("nail");
                setServicePrice(250000);
                setServiceDuration(45);
                setServiceDescription("");
                setServiceImageUrl(DEFAULT_SERVICE_IMAGE);
                setIsServiceFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4a2d31] text-white text-xs font-semibold hover:bg-[#5f363b] cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm dịch vụ</span>
            </button>
          </div>

          {isLoadingServices ? (
            <div className="bg-white p-12 rounded-2xl border border-[#ede3dc] flex items-center justify-center gap-2 text-sm text-[#7d6c65]">
              <Loader2 size={18} className="animate-spin text-[#4a2d31]" />
              <span>Đang tải danh sách dịch vụ...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-[#ede3dc] text-center text-sm text-[#8c7b74]">
              Chưa có dịch vụ nào trên hệ thống. Bấm &quot;+ Thêm dịch vụ&quot;
              để tạo mới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className={`bg-white rounded-2xl border border-[#ede3dc] overflow-hidden shadow-sm flex flex-col ${
                    !srv.is_active ? "opacity-60" : ""
                  }`}
                >
                  <img
                    src={srv.image_url || DEFAULT_SERVICE_IMAGE}
                    alt={srv.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#f4ebe6] text-[#6d4239]">
                          {srv.category || "nail"}
                        </span>
                        <span className="text-xs text-[#8c7b74]">
                          {srv.duration_minutes} phút
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#342420] mt-1.5">
                        {srv.name}
                      </h4>
                      <p className="text-xs text-[#8c7b74] line-clamp-2 mt-1">
                        {srv.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#f3eae4] flex items-center justify-between">
                      <span className="font-bold text-sm text-[#a66258]">
                        {formatPriceVND(srv.price)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleServiceActive(srv)}
                          className="px-2 py-1 rounded-lg text-[11px] font-medium bg-[#fbf6f3] text-[#4a2d31] hover:bg-[#f0e3dc] cursor-pointer"
                        >
                          {srv.is_active ? "Đang bật" : "Đã ẩn"}
                        </button>
                        <button
                          onClick={() => handleOpenEditService(srv)}
                          className="p-1.5 rounded-lg bg-[#f6eee9] text-[#4a2d31] hover:bg-[#4a2d31] hover:text-white cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL THÊM / SỬA DỊCH VỤ */}
      {isServiceFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveService}
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3.5 shadow-2xl border border-[#ede3dc]"
          >
            <div className="flex items-center justify-between border-b border-[#f3eae4] pb-3">
              <h3 className="font-bold text-base text-[#342420]">
                {editingServiceId ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
              </h3>
              <button
                type="button"
                onClick={() => setIsServiceFormOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#f6eee9] text-[#8c7b74]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4a2d31] mb-1">
                  Tên dịch vụ *
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="VD: Sơn gel thạch Hàn Quốc"
                  className="w-full px-3 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#4a2d31] mb-1">
                    Danh mục
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) =>
                      setServiceCategory(e.target.value as ServiceCategory)
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                  >
                    <option value="nail">Nail</option>
                    <option value="gội đầu">Gội đầu</option>
                    <option value="combo">Combo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4a2d31] mb-1">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    step={10000}
                    value={servicePrice}
                    onChange={(e) => setServicePrice(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4a2d31] mb-1">
                    Phút
                  </label>
                  <input
                    type="number"
                    step={5}
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4a2d31] mb-1">
                  Hình ảnh dịch vụ
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={serviceImageUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-[#e5d8d0]"
                  />
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-[#c9b4ab] bg-[#fbf8f6] hover:bg-[#f4ebe6] cursor-pointer text-[#4a2d31] font-medium">
                    {isUploadingImage ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Đang tải ảnh lên...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Chọn ảnh từ máy</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4a2d31] mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Mô tả quy trình, sản phẩm sử dụng..."
                  className="w-full px-3 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f3eae4]">
              <button
                type="button"
                onClick={() => setIsServiceFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#fbf6f3] text-[#6d5c56]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingService || isUploadingImage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#4a2d31] text-white hover:bg-[#5f363b] disabled:opacity-60"
              >
                {isSubmittingService && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                <span>
                  {editingServiceId ? "Lưu cập nhật" : "Thêm dịch vụ"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
