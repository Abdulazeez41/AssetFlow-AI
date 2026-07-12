"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-slate-950 hover:bg-emerald-300",
  secondary: "bg-white/10 text-white hover:bg-white/20",
  ghost: "bg-transparent text-slate-200 hover:bg-white/10",
  success: "bg-sky text-slate-950 hover:bg-sky-300",
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: keyof typeof variants;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "default", ...props }, ref) {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: props.disabled ? 1 : 1.02 }}
        whileTap={{ scale: props.disabled ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
