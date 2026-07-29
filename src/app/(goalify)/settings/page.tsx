import type { Metadata } from "next";
import { SettingsScreen } from "@/components/goalify/settings";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Notification toggles, profile details, subscription status and knee-safe workout mode.",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
