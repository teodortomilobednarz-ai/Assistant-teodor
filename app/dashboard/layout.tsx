import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  DashboardSidebar,
  MobileTopBar,
  type SidebarUser,
} from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Route protection: unauthenticated visitors are sent to the landing page.
  if (!session?.user) {
    redirect("/");
  }

  const user: SidebarUser = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <DashboardSidebar user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar user={user} />
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="aurora opacity-40 print:hidden" />
          <div className="relative flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
