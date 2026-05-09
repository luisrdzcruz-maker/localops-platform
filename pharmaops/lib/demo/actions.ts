"use server";

import { revalidatePath } from "next/cache";
import { clearDemoData, loadDemoData } from "./store";

/** Reseed the demo store from scratch and refresh all dashboards. */
export async function loadDemoDataAction(): Promise<void> {
  loadDemoData();
  revalidatePath("/", "layout");
}

/** Empty the demo store. Used to preview the empty-state UX. */
export async function clearDemoDataAction(): Promise<void> {
  clearDemoData();
  revalidatePath("/", "layout");
}
