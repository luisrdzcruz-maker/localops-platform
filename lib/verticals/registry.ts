import type { VerticalKey } from "@/types/modules";
import type { VerticalConfig } from "./types";
import { pharmaVertical } from "./pharma";
import { constructionVertical } from "./construction";
import { dentalVertical } from "./dental";

export const verticalRegistry: Record<VerticalKey, VerticalConfig> = {
  pharma: pharmaVertical,
  construction: constructionVertical,
  dental: dentalVertical
};

export const verticals = Object.values(verticalRegistry);

export function getVerticalConfig(key: VerticalKey): VerticalConfig {
  return verticalRegistry[key];
}
