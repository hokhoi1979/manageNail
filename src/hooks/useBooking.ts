"use client";

import { bookingService } from "@/libs/services/bookings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";

export const useBookingAll = () => {
  return useQuery({
    queryKey: ["bookings", "all"],
    queryFn: () => bookingService.getAll(),
    retry: false, // Thêm dòng này để tắt auto-retry
    placeholderData: [],
  });
};

// Lấy các khung giờ bận để hiển thị / chặn trên Calendar
export const useBusySlots = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["bookings", "busySlots", startDate, endDate],
    queryFn: () => bookingService.getBusySlots(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useConfirmBooking = (bookingId: string) => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: () => bookingService.confirmBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "all"] });
      message.success("Xác nhận lịch hẹn thành công");
    },
  });
};

export const useCancelBooking = (bookingId: string) => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (cancelReason?: string) =>
      bookingService.cancelByCustomer(bookingId, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "all"] });
      message.success("Hủy lịch hẹn thành công");
    },
  });
};
