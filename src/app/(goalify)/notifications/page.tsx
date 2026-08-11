import type { Metadata } from "next";
import { NotificationsPreview } from "@/components/goalify/notifications-preview";

export const metadata: Metadata = {
  title: "Daily reminders",
  description:
    "Preview the four daily lock-screen notifications: morning motivation, fuel check, water check and workout alert.",
};

export default function NotificationsPage() {
  return <NotificationsPreview />;
}
