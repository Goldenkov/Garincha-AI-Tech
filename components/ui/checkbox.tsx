"use client";

import * as React from "react";
import type { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <span className="relative inline-flex size-5 shrink-0 items-center justify-center">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer size-5 appearance-none rounded border border-white/20 bg-white/[0.04] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 checked:border-cyan-300 checked:bg-cyan-300",
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        className="pointer-events-none absolute size-3.5 text-slate-950 opacity-0 transition peer-checked:opacity-100"
      />
    </span>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
