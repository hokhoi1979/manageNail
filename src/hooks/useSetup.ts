"use client";

import {
  setupService,
  SaveSalonSchedulePayload,
  SalonServiceItem,
} from "@/libs/services/setup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";

export const SETUP_SCHEDULE_KEY = ["setup", "schedule"] as const;
export const SETUP_SERVICES_KEY = ["setup", "services"] as const;

// ==========================================
// 1. HOOKS LỊCH LÀM VIỆC & NGÀY NGOẠI LỆ
// ==========================================
export const useScheduleSetup = () => {
  return useQuery({
    queryKey: SETUP_SCHEDULE_KEY,
    queryFn: () => setupService.getScheduleSetup(),
    retry: false,
  });
};

export const useEffectiveHoursForDate = (dateStr: string) => {
  return useQuery({
    queryKey: ["setup", "effectiveHours", dateStr],
    queryFn: () => setupService.getEffectiveHoursForDate(dateStr),
    enabled: !!dateStr,
  });
};

export const useSaveScheduleSetup = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: SaveSalonSchedulePayload) =>
      setupService.saveScheduleSetup(payload),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(SETUP_SCHEDULE_KEY, updatedData);
      queryClient.invalidateQueries({ queryKey: ["setup"] });
      message.success("Đã lưu cấu hình lịch làm việc!");
    },
    onError: (error: Error) => {
      message.error(error.message || "Lưu cấu hình thất bại!");
    },
  });
};

export const useDeleteDateOverride = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (overrideDate: string) =>
      setupService.deleteDateOverride(overrideDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETUP_SCHEDULE_KEY });
      message.success("Đã xóa ngày ngoại lệ!");
    },
    onError: (error: Error) => {
      message.error(error.message || "Không thể xóa ngày ngoại lệ!");
    },
  });
};

// ==========================================
// 2. HOOKS MENU DỊCH VỤ
// ==========================================
export const useSetupServices = () => {
  return useQuery({
    queryKey: SETUP_SERVICES_KEY,
    queryFn: () => setupService.getAllServices(),
    retry: false,
  });
};

export const useCreateSetupService = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: Partial<SalonServiceItem>) =>
      setupService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETUP_SERVICES_KEY });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      message.success("Thêm dịch vụ mới thành công!");
    },
    onError: (error: Error) => {
      message.error(error.message || "Không thể thêm dịch vụ!");
    },
  });
};

export const useUpdateSetupService = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<SalonServiceItem>;
    }) => setupService.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETUP_SERVICES_KEY });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      message.success("Cập nhật dịch vụ thành công!");
    },
    onError: (error: Error) => {
      message.error(error.message || "Không thể cập nhật dịch vụ!");
    },
  });
};

export const useDeleteSetupService = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: string) => setupService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETUP_SERVICES_KEY });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      message.success("Đã xóa dịch vụ!");
    },
    onError: (error: Error) => {
      message.error(error.message || "Không thể xóa dịch vụ!");
    },
  });
};
