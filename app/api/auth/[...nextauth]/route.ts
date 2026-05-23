// Auth.js v5 route handler — expõe /api/auth/*
// (callback do Google chega em /api/auth/callback/google)
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
