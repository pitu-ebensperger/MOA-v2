/**
 * Export UI tokens to JSON for design tools (Figma, Sketch, etc.)
 * Run with: node frontend/scripts/export-tokens.js
 * 
 * Generates: frontend/dist/design-tokens.json
 */

/* eslint-env node */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Import tokens
import {
  PILL_STYLES,
  BADGE_VARIANTS,
  BADGE_SIZES,
  BUTTON_APPEARANCES,
  BUTTON_INTENTS,
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_WIDTHS,
  BUTTON_ALIGNS,
  BUTTON_ELEVATIONS,
  BUTTON_ICON_PLACEMENTS,
  DEFAULT_BUTTON_OPTIONS,
  BUTTON_MOTION_EFFECTS,
  BUTTON_LEGACY_VARIANTS,
} from "../src/config/ui-tokens.js";

import {
  PRODUCT_STATUS_MAP,
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  SHIPPING_STATUS_MAP,
  USER_STATUS_MAP,
} from "../src/config/status-maps.js";

import {
  DEFAULT_PAGE_SIZE,
  LOW_STOCK_THRESHOLD,
  ALL_CATEGORY_ID,
  DEFAULT_PLACEHOLDER_IMAGE,
} from "../src/config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build design tokens structure
const designTokens = {
  $schema: "https://schemas.livingdocs.io/design-tokens/v1.0.0",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
  
  // UI Components
  components: {
    pill: {
      variants: Object.keys(PILL_STYLES),
      styles: PILL_STYLES,
    },
    badge: {
      variants: Object.keys(BADGE_VARIANTS),
      sizes: Object.keys(BADGE_SIZES),
      variantStyles: BADGE_VARIANTS,
      sizeStyles: BADGE_SIZES,
    },
    button: {
      appearances: BUTTON_APPEARANCES,
      intents: BUTTON_INTENTS,
      sizes: BUTTON_SIZES,
      shapes: BUTTON_SHAPES,
      widths: BUTTON_WIDTHS,
      aligns: BUTTON_ALIGNS,
      elevations: BUTTON_ELEVATIONS,
      iconPlacements: BUTTON_ICON_PLACEMENTS,
      motionEffects: BUTTON_MOTION_EFFECTS,
      defaults: DEFAULT_BUTTON_OPTIONS,
      legacyVariants: BUTTON_LEGACY_VARIANTS,
    },
  },

  // Status System
  status: {
    product: {
      states: Object.keys(PRODUCT_STATUS_MAP),
      map: PRODUCT_STATUS_MAP,
    },
    order: {
      states: Object.keys(ORDER_STATUS_MAP),
      map: ORDER_STATUS_MAP,
    },
    payment: {
      states: Object.keys(PAYMENT_STATUS_MAP),
      map: PAYMENT_STATUS_MAP,
    },
    shipment: {
      states: Object.keys(SHIPPING_STATUS_MAP),
      map: SHIPPING_STATUS_MAP,
    },
    user: {
      states: Object.keys(USER_STATUS_MAP),
      map: USER_STATUS_MAP,
    },
  },

  // Constants
  constants: {
    pagination: {
      defaultPageSize: DEFAULT_PAGE_SIZE,
    },
    inventory: {
      lowStockThreshold: LOW_STOCK_THRESHOLD,
    },
    categories: {
      allCategoryId: ALL_CATEGORY_ID,
    },
    placeholders: {
      defaultImage: DEFAULT_PLACEHOLDER_IMAGE,
    },
  },

  // Metadata
  meta: {
    repository: "MOA",
    branch: "dev",
    description: "MOA Design System Tokens - Auto-generated from config/ui-tokens.js",
    usage: "Import this file into Figma, Sketch, or other design tools",
  },
};

// Write to file
const outputDir = join(__dirname, "..", "dist");
const outputPath = join(outputDir, "design-tokens.json");

try {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, JSON.stringify(designTokens, null, 2), "utf-8");
  
  console.log("✅ Design tokens exported successfully!");
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📊 Tokens exported:`);
  console.log(`   - ${Object.keys(BADGE_VARIANTS).length} Badge variants`);
  console.log(`   - ${Object.keys(PILL_STYLES).length} Pill styles`);
  console.log(`   - ${BUTTON_APPEARANCES.length} Button appearances`);
  console.log(`   - ${BUTTON_INTENTS.length} Button intents`);
  console.log(`   - ${Object.keys(PRODUCT_STATUS_MAP).length} Product statuses`);
  console.log(`   - ${Object.keys(ORDER_STATUS_MAP).length} Order statuses`);
  console.log(`   - ${Object.keys(PAYMENT_STATUS_MAP).length} Payment statuses`);
  console.log(`   - ${Object.keys(SHIPPING_STATUS_MAP).length} Shipment statuses`);
  console.log(`   - ${Object.keys(USER_STATUS_MAP).length} User statuses`);
  
  // eslint-disable-next-line no-undef
  process.exit(0);
} catch (error) {
  console.error("❌ Failed to export design tokens:");
  console.error(error);
  // eslint-disable-next-line no-undef
  process.exit(1);
}
