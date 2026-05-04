import Link from "next/link";
import { cloneElement, isValidElement } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "default" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-300 text-slate-950 shadow-[0_0_35px_rgba(103,232,249,0.35)] hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_0_48px_rgba(103,232,249,0.48)] active:translate-y-0",
  secondary:
    "border border-white/15 bg-white/[0.08] text-white hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-white/[0.12] active:translate-y-0",
  outline:
    "border border-white/15 bg-white/[0.04] text-white hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-white/[0.10] active:translate-y-0",
  ghost: "text-slate-200 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white active:translate-y-0",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  default: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-12 px-6 py-3.5 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-semibold transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

export function Button({
  children,
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, variants[variant], sizes[size], className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;

    return cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export function ButtonLink({
  children,
  className,
  variant = "primary",
  size = "default",
  href,
  ...props
}: ButtonLinkProps) {
  const classes = cn(baseClasses, variants[variant], sizes[size], className);

  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} {...props}>
      {children}
    </Link>
  );
}
