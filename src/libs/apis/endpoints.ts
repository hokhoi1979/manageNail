"use client";
export const endpoints = {
  services: "services",
  bookings: "bookings",
  auth: {
    login: "/auth/v1/token?grant_type=password",
    register: "/auth/v1/signup",
    refresh: "/auth/v1/token?grant_type=refresh_token",
  },
  // Supabase Database endpoints (đường dẫn rest/v1)
  users: "/rest/v1/profiles",
} as const;
