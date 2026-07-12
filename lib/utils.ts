import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount < 1 ? 2 : 0,
    maximumFractionDigits: amount < 1 ? 2 : 0,
  }).format(amount);
}

export function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

export function truncateHash(value: string, start = 6, end = 4) {
  if (!value) return "Pending";
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
