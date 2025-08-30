import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  ClipboardList,
  FileSignature,
  Hospital,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { ActiveLink, navigate, useLocationChange } from "raviger";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { Avatar } from "@/components/common/Avatar";

import { useAuthContext } from "@/hooks/useAuth";

import routes from "@/api";
import { getProfilePhotoUrl } from "@/utils";
import { query } from "@/utils/request/request";

const items = (unreadCount: number | undefined) => [
  {
    title: "My Records",
    url: "/my-records",
    icon: <ClipboardList />,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: <User />,
  },
  {
    title: "Consents",
    url: "/consents",
    icon: <FileSignature />,
  },
  {
    title: "Linked Facilities",
    url: "/linked-facilities",
    icon: <Hospital />,
  },
  {
    title: "Health Lockers",
    url: "/health-lockers",
    icon: <Shield />,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: <Bell />,
    badge: unreadCount,
  },
];

export function AppSidebar() {
  const { logout, user } = useAuthContext();
  const { isMobile, setOpenMobile, open } = useSidebar();

  const { data: unreadCount } = useQuery({
    queryKey: ["notificationUnreadCount"],
    queryFn: query(routes.notification.unreadCount, {
      silent: true,
    }),
  });

  useLocationChange(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  });

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="group-data-[side=left]:border-r-0"
    >
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items(unreadCount?.unread_count).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={{
                      children: item.title,
                      className: "text-white",
                    }}
                    className="text-gray-600 transition font-normal hover:bg-gray-200 hover:text-green-700"
                  >
                    <ActiveLink
                      href={item.url}
                      activeClass="bg-white text-green-700 shadow-sm relative"
                    >
                      {item.icon}

                      {!!item.badge && (
                        <span className="hidden group-data-[collapsible=icon]:block absolute top-2 right-2 size-2 rounded-full bg-red-500" />
                      )}

                      <span className="ml-1 flex w-full items-center justify-between group-data-[collapsible=icon]:hidden">
                        {item.title}
                        {!!item.badge && (
                          <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 mt-1">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </ActiveLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar
                    className="size-8 rounded-lg"
                    name={user?.fullName ?? ""}
                    imageUrl={getProfilePhotoUrl(user?.profilePhoto ?? null)}
                  />
                  {(open || isMobile) && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.fullName}
                        </span>
                        <span className="truncate text-xs">
                          {user?.abhaAddress}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar
                      className="size-8 rounded-lg"
                      name={user?.fullName ?? ""}
                      imageUrl={getProfilePhotoUrl(user?.profilePhoto ?? null)}
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.fullName}
                      </span>
                      <span className="truncate text-xs">
                        {user?.abhaAddress}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    data-cy="user-menu-profile"
                    onClick={() => navigate("/profile")}
                  >
                    <BadgeCheck />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-cy="user-menu-logout"
                  onClick={() => logout()}
                >
                  <LogOut />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="hover:after:bg-transparent hover:bg-transparent" />
    </Sidebar>
  );
}
