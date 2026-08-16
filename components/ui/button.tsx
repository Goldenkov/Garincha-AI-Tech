import Link from "next/link";
import { cloneElement, isValidElement } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "default" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "button-3d-primary",
  secondary: "button-3d-secondary",
  outline: "button-3d-outline",
  ghost: "button-3d-ghost",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  default: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-12 px-6 py-3.5 text-base",
};

const baseClasses =
  "premium-button-3d inline-flex max-w-full items-center justify-center overflow-hidden rounded-full font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60";

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
