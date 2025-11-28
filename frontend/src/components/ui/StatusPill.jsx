import React from "react";
import PropTypes from "prop-types";
import Pill from "@/components/ui/Pill.jsx"
import {
  PRODUCT_STATUS_MAP,
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  SHIPPING_STATUS_MAP,
  USER_STATUS_MAP,
} from "../../config/status-maps.js";

// domain = "product" | "order" | "payment" | "shipment" | "user" 
const DOMAIN_MAP = {
  product: PRODUCT_STATUS_MAP,
  order: ORDER_STATUS_MAP,
  payment: PAYMENT_STATUS_MAP,
  shipment: SHIPPING_STATUS_MAP,
  user: USER_STATUS_MAP,
};

const STATUS_PILL_SIZES = ["sm", "md", "lg"];

export function StatusPill({
  status,
  domain = "order",
  intent,
  label,
  size = "md",
  className = "",
  children,
}) {
  const map = DOMAIN_MAP[domain] ?? {};
  const key = status == null ? "" : String(status).toLowerCase();

  const conf = map[key] ?? { variant: "neutral", label: key };
  const variant = intent || conf.variant || "neutral";
  const content = children ?? label ?? conf.label ?? (status ? key.replace(/_/g, " ") : "-");

  return (
    <Pill variant={variant} size={size} className={className}>
      {content}
    </Pill>
  );
}

StatusPill.propTypes = {
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  domain: PropTypes.oneOf(["product", "order", "payment", "shipment", "user"]),
  intent: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOf(STATUS_PILL_SIZES),
  className: PropTypes.string,
  children: PropTypes.node,
};
