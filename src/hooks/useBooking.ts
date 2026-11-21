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
