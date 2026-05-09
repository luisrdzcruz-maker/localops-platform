import type { CoreModuleKey, DashboardWidgetKey, VerticalKey, VerticalNavigationItem } from "@/types/modules";
import type { PermissionKey } from "@/types/permissions";
import type { VerticalAiActionKey } from "@/types/ai";

export interface VerticalConfig {
  key: VerticalKey;
  name: string;
  commercialName: string;
  description: string;
  primaryContactLabel: string;
  primaryContactPluralLabel: string;
  icon: string;
  accent: string;
  enabledModules: CoreModuleKey[];
  primaryEntities: string[];
  dashboardWidgets: DashboardWidgetKey[];
  terminology: Record<string, string>;
  navigation: VerticalNavigationItem[];
  aiActions: VerticalAiActionKey[];
  permissions: PermissionKey[];
  onboardingSteps: string[];
  emptyStates: Record<string, string>;
}
