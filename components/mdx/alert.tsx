import React from "react";
import { cn } from "@/lib/utils";

import { AlertTriangle, Info as InfoIcon, XCircle } from "lucide-react";

const ALERT_VARIANTS = {
  info: {
    title: "Info",
    icon: InfoIcon,
    styles:
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200",
  },
  warning: {
    title: "Warning",
    icon: AlertTriangle,
    styles:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200",
  },
  issue: {
    title: "Issue",
    icon: XCircle,
    styles:
      "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200",
  },
};

type AlertVariantType = keyof typeof ALERT_VARIANTS;

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  type?: AlertVariantType;
  content?: React.ReactNode;
  node?: unknown;
}

export const Alert = ({
  content,
  children,
  className,
  type = "info", // Default to info
  node, // Extracted to be removed
  ...props // Spread to the element for added flexibility
}: AlertProps) => {
  const variant =
    ALERT_VARIANTS[type as AlertVariantType] || ALERT_VARIANTS.info;
  const Icon = variant.icon;

  return (
    <span
      className={cn(
        "flex items-start gap-3 p-4 my-4 rounded-lg border",
        variant.styles,
        className
      )}
      {...props}
    >
      <span className="shrink-0 mt-0.5">
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-sm leading-relaxed block">
        <strong className="font-bold">{variant.title}: </strong>
        {content || children}
      </span>
    </span>
  );
};

// Sub-types
export const Info = (props: AlertProps) => <Alert type="info" {...props} />;
export const Warning = (props: AlertProps) => (
  <Alert type="warning" {...props} />
);
export const Issue = (props: AlertProps) => <Alert type="issue" {...props} />;
