"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BookingItem, BookingStatus } from "@/app/calender/page";
import { useCancelBooking, useConfirmBooking } from "@/hooks/useBooking";

interface ModalActionProps {
  booking: BookingItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: BookingStatus) => void;
}

const formatPriceVND = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
};

export function ModalAction({
  booking,
  onClose,
  onUpdateStatus,
}: ModalActionProps) {
  const [confirmAction, setConfirmAction] = useState<
    "confirmed" | "cancelled" | null
  >(null);

  const confirmBooking = useConfirmBooking(booking?.id ?? "");
  const cancelBooking = useCancelBooking(booking?.id ?? "");

  const isSubmitting = confirmBooking.isPending || cancelBooking.isPending;

  if (!booking) return null;

  const isPending = booking.status === "pending";

  const handleCloseAll = () => {
    if (isSubmitting) return;
    setConfirmAction(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!confirmAction || isSubmitting) return;

    const mutation =
      confirmAction === "confirmed" ? confirmBooking : cancelBooking;

    mutation.mutate(undefined, {
      onSuccess: () => {
        onUpdateStatus(booking.id, confirmAction);
        setConfirmAction(null);
      },
      onError: (error) => {
        console.error("Error updating booking status:", error);
      },
    });
  };

  return (
    <>
      {/* MODAL CHI TIẾT LỊCH HẸN */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={handleCloseAll}
      >
        <div
          className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-[#ede3dc]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#f3eae4] pb-3">
            <div>
              <span className="text-[11px] font-mono text-[#8c7b74]">
                Mã lịch: {booking.booking_code}
              </span>
              <h3 className="font-bold text-base text-[#342420]">
                {booking.customer_name}
              </h3>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCloseAll}
              className="p-1.5 rounded-lg hover:bg-[#f6eee9] text-[#8c7b74] cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8c7b74]">Số điện thoại:</span>
              <span className="font-semibold">{booking.customer_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8c7b74]">Thời gian hẹn:</span>
              <span className="font-semibold">
                {booking.start_time} - {booking.end_time} ({booking.date_str})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8c7b74]">Dịch vụ:</span>
              <span className="font-semibold capitalize">
                {booking.service_title}
              </span>
            </div>

            {booking.customer_note && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 text-amber-900 border border-amber-200/60">
                <strong>Ghi chú khách:</strong> {booking.customer_note}
              </div>
            )}

            {booking.status === "cancelled" && booking.cancel_reason && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/70">
                <strong>Lý do hủy:</strong> {booking.cancel_reason}
                {booking.cancelled_by && (
                  <span className="block text-[11px] opacity-80 mt-0.5">
                    Người hủy:{" "}
                    {booking.cancelled_by === "customer"
                      ? "Khách hàng"
                      : "Salon"}
                  </span>
                )}
              </div>
            )}

            <div className="bg-[#fbf8f6] p-3 rounded-xl border border-[#ede3dc] flex justify-between font-bold text-sm text-[#4a2d31]">
              <span>Tổng dự kiến</span>
              <span>{formatPriceVND(booking.total_price)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          {isPending && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3eae4]">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmAction("cancelled")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Từ chối
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmAction("confirmed")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Duyệt lịch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* POPUP XÁC NHẬN THAO TÁC */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setConfirmAction(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#ede3dc]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmAction === "confirmed"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {confirmAction === "confirmed" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#342420]">
                  {confirmAction === "confirmed"
                    ? "Xác nhận duyệt lịch?"
                    : "Xác nhận từ chối lịch?"}
                </h4>
                <p className="text-xs text-[#6d5c56] leading-relaxed">
                  Bạn có chắc chắn muốn{" "}
                  <strong>
                    {confirmAction === "confirmed" ? "duyệt" : "từ chối"}
                  </strong>{" "}
                  lịch hẹn <strong>{booking.booking_code}</strong> của khách{" "}
                  <strong>{booking.customer_name}</strong> không?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3eae4]">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmAction(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#fbf6f3] text-[#6d5c56] hover:bg-[#f3e7e1] transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirm}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 ${
                  confirmAction === "confirmed"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalAction;
