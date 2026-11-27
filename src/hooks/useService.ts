"use client";

import { serviceService, ServiceItem } from "@/libs/services/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";

export const SERVICES_QUERY_KEY = ["services", "all"] as const;

export const useServiceAll = () => {
  return useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: () => serviceService.getAll(),
    retry: false,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: Partial<ServiceItem>) =>
      serviceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      message.success("Thêm dịch vụ mới thành công!");
    },
    onError: (err: Error) => {
      message.error(err.message || "Không thể thêm dịch vụ!");
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ServiceItem>;
    }) => serviceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      message.success("Cập nhật dịch vụ thành công!");
    },
    onError: (err: Error) => {
      message.error(err.message || "Không thể cập nhật dịch vụ!");
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      message.success("Đã xóa dịch vụ!");
    },
    onError: (err: Error) => {
      message.error(err.message || "Không thể xóa dịch vụ!");
    },
  });
};
