import { listNotifications } from "@/lib/actions";
import { mapNotification } from "@/lib/mappers";
import { NotificationsClient } from "./client";

export default async function NotificationsPage() {
  const { data } = await listNotifications({ pageSize: 50 });
  const notifications = data ? data.map(mapNotification) : [];

  return <NotificationsClient initialNotifications={notifications} />;
}
