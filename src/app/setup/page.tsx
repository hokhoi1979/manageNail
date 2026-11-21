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
} from "lucide-react";

export interface SalonService {
  id: string;
  name: string;
  category: "nail" | "gội đầu" | "combo";
  price: number;
  original_price?: number;
  duration_minutes: number;
  image_url: string;
  description: string;
  is_active: boolean;
}

export interface WorkingDaySchedule {
  day_code: string;
  day_name: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

const INITIAL_SERVICES: SalonService[] = [
  {
    id: "srv-01",
    name: "Sơn Gel thạch Hàn Quốc cao cấp",
    category: "nail",
    price: 230000,
    duration_minutes: 45,
    image_url:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80",
    description:
      "Sử dụng sơn gel nhập khẩu chính hãng Hàn Quốc, màu sắc trong trẻo bóng bẩy, bền màu trên 3 tuần mà không làm yếu móng thật.",
    is_active: true,
  },
  {
    id: "srv-02",
    name: "Gội đầu dưỡng sinh thảo dược bồ kết 14 bước",
    category: "gội đầu",
    price: 350000,
    duration_minutes: 60,
    image_url:
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=600&q=80",
    description:
      "Quy trình gội đầu thư giãn canh thảo dược ấm, kết hợp bấm huyệt cổ vai gáy và xông thảo mộc tự nhiên thải độc da đầu.",
    is_active: true,
  },
  {
    id: "srv-03",
    name: "Combo VIP: Đắp bột ombre móng + Gội đầu thư giãn",
    category: "combo",
    price: 850000,
    duration_minutes: 110,
    image_url:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80",
    description:
      "Gói dịch vụ hoàn hảo kết hợp làm móng đắp bột phom chuẩn hoa văn sang trọng và gội đầu xả stress toàn diện.",
    is_active: true,
  },
  {
    id: "srv-04",
    name: "Úp móng Gel tip siêu nhẹ phom thang",
    category: "nail",
    price: 320000,
    duration_minutes: 50,
    image_url:
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80",
    description:
      "Kỹ thuật úp móng không cấn da, nhẹ tênh tự nhiên như móng thật, dễ sinh hoạt và giữ bền tới 4 tuần.",
    is_active: true,
  },
];

const INITIAL_SCHEDULE: WorkingDaySchedule[] = [
  {
    day_code: "mon",
    day_name: "Thứ Hai",
    is_open: true,
    open_time: "08:30",
    close_time: "20:30",
  },
  {
    day_code: "tue",
    day_name: "Thứ Ba",
    is_open: true,
    open_time: "08:30",
    close_time: "20:30",
  },
  {
    day_code: "wed",
    day_name: "Thứ Tư",
    is_open: true,
    open_time: "08:30",
    close_time: "20:30",
  },
  {
    day_code: "thu",
    day_name: "Thứ Năm",
    is_open: true,
    open_time: "08:30",
    close_time: "20:30",
  },
  {
    day_code: "fri",
    day_name: "Thứ Sáu",
    is_open: true,
    open_time: "08:30",
    close_time: "21:00",
  },
  {
    day_code: "sat",
    day_name: "Thứ Bảy",
    is_open: true,
    open_time: "08:00",
    close_time: "21:30",
  },
  {
    day_code: "sun",
    day_name: "Chủ Nhật",
    is_open: true,
    open_time: "08:00",
    close_time: "21:00",
  },
];

const formatPriceVND = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

interface SetupTabProps {
  onShowToast?: (msg: string) => void;
}

export default function SetupTab({ onShowToast }: SetupTabProps) {
  const [setupSubTab, setSetupSubTab] = useState<"schedule" | "services">(
    "schedule",
  );
  const [workingSchedule, setWorkingSchedule] =
    useState<WorkingDaySchedule[]>(INITIAL_SCHEDULE);
  const [slotDuration, setSlotDuration] = useState<number>(45);
  const [maxCustomersPerSlot, setMaxCustomersPerSlot] = useState<number>(2);
  const [services, setServices] = useState<SalonService[]>(INITIAL_SERVICES);

  // Form Thêm/Sửa Dịch vụ
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState<
    "nail" | "gội đầu" | "combo"
  >("nail");
  const [servicePrice, setServicePrice] = useState<number>(250000);
  const [serviceDuration, setServiceDuration] = useState<number>(45);
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceImageUrl, setServiceImageUrl] = useState(
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80",
  );

  const handleToggleDay = (day_code: string) => {
    setWorkingSchedule((prev) =>
      prev.map((d) =>
        d.day_code === day_code ? { ...d, is_open: !d.is_open } : d,
      ),
    );
  };

  const handleUpdateDayTime = (
    day_code: string,
    field: "open_time" | "close_time",
    value: string,
  ) => {
    setWorkingSchedule((prev) =>
      prev.map((d) => (d.day_code === day_code ? { ...d, [field]: value } : d)),
    );
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setServiceImageUrl(tempUrl);
      onShowToast?.("Đã chọn ảnh tải lên thành công!");
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      alert("Vui lòng nhập tên dịch vụ!");
      return;
    }

    if (editingServiceId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingServiceId
            ? {
                ...s,
                name: serviceName,
                category: serviceCategory,
                price: Number(servicePrice),
                duration_minutes: Number(serviceDuration),
                image_url: serviceImageUrl,
                description: serviceDescription,
              }
            : s,
        ),
      );
      onShowToast?.("Cập nhật dịch vụ thành công!");
    } else {
      const newService: SalonService = {
        id: `srv-${Date.now()}`,
        name: serviceName,
        category: serviceCategory,
        price: Number(servicePrice),
        duration_minutes: Number(serviceDuration),
        image_url: serviceImageUrl,
        description: serviceDescription,
        is_active: true,
      };
      setServices((prev) => [newService, ...prev]);
      onShowToast?.("Thêm dịch vụ mới thành công!");
    }

    setIsServiceFormOpen(false);
    setEditingServiceId(null);
    setServiceName("");
    setServicePrice(250000);
    setServiceDuration(45);
    setServiceDescription("");
  };

  const handleOpenEditService = (service: SalonService) => {
    setEditingServiceId(service.id);
    setServiceName(service.name);
    setServiceCategory(service.category);
    setServicePrice(service.price);
    setServiceDuration(service.duration_minutes);
    setServiceImageUrl(service.image_url);
    setServiceDescription(service.description);
    setIsServiceFormOpen(true);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dịch vụ này khỏi menu salon?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      onShowToast?.("Đã xóa dịch vụ!");
    }
  };

  const handleToggleServiceActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s)),
    );
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                onClick={() => onShowToast?.("Đã lưu cấu hình lịch làm việc!")}
                className="px-4 py-2 rounded-xl bg-[#4a2d31] text-white text-xs font-semibold hover:bg-[#5f363b] cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>

            <div className="divide-y divide-[#f3eae4]">
              {workingSchedule.map((day) => (
                <div
                  key={day.day_code}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <label className="flex items-center gap-3 cursor-pointer min-w-[130px]">
                    <input
                      type="checkbox"
                      checked={day.is_open}
                      onChange={() => handleToggleDay(day.day_code)}
                      className="w-4 h-4 accent-[#4a2d31] rounded cursor-pointer"
                    />
                    <span
                      className={`text-sm font-semibold ${
                        day.is_open
                          ? "text-[#342420]"
                          : "text-[#a69690] line-through"
                      }`}
                    >
                      {day.day_name}
                    </span>
                  </label>

                  {day.is_open ? (
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="time"
                        value={day.open_time}
                        onChange={(e) =>
                          handleUpdateDayTime(
                            day.day_code,
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
                            day.day_code,
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

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#ede3dc] shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-base text-[#342420] border-b border-[#f3eae4] pb-3">
              Cấu hình ca đặt lịch
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-[#4a2d31] mb-1">
                  Bước nhảy khung giờ (phút)
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
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
                  value={maxCustomersPerSlot}
                  onChange={(e) =>
                    setMaxCustomersPerSlot(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#e5d8d0] bg-[#fbf8f6]"
                />
                <p className="text-[11px] text-[#8c7b74] mt-1">
                  Phù hợp với số lượng ghế/nhân sự hiện tại của salon.
                </p>
              </div>
            </div>
          </div>
        </div>
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
                setIsServiceFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4a2d31] text-white text-xs font-semibold hover:bg-[#5f363b] cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm dịch vụ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className={`bg-white rounded-2xl border border-[#ede3dc] overflow-hidden shadow-sm flex flex-col ${
                  !srv.is_active ? "opacity-60" : ""
                }`}
              >
                <img
                  src={srv.image_url}
                  alt={srv.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#f4ebe6] text-[#6d4239]">
                        {srv.category}
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
                        onClick={() => handleToggleServiceActive(srv.id)}
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
                      setServiceCategory(
                        e.target.value as "nail" | "gội đầu" | "combo",
                      )
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
                    <Upload size={14} />
                    <span>Chọn ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
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
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4a2d31] text-white hover:bg-[#5f363b]"
              >
                {editingServiceId ? "Lưu cập nhật" : "Thêm dịch vụ"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
