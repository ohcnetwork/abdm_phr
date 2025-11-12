import { Redirect, useRoutes } from "raviger";

import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import ErrorBoundary from "@/components/errors/ErrorBoundary";
import FallbackErrorPage from "@/components/errors/FallbackErrorPage";
import SessionExpired from "@/components/errors/SessionExpired";

import useSidebarState from "@/hooks/useSidebarState";

import Consent from "@/pages/consent/Consent";
import ConsentDetail from "@/pages/consent/ConsentDetail";
import Dashboard from "@/pages/dashboard/Dashboard";
import MyRecordDetail from "@/pages/dashboard/LinkedRecordDetail";
import HealthLocker from "@/pages/healthLocker/HealthLocker";
import HealthLockerDetail from "@/pages/healthLocker/HealthLockerDetail";
import AddFacility from "@/pages/linkedFacility/AddFacility";
import AddFacilityDetail from "@/pages/linkedFacility/AddFacilityDetail";
import LinkedFacility from "@/pages/linkedFacility/LinkedFacility";
import LinkedFacilityDetail from "@/pages/linkedFacility/LinkedFacilityDetail";
import Notifications from "@/pages/notification/Notification";
import Profile from "@/pages/profile/Profile";
import ScanAndShare from "@/pages/scanAndShare/ScanAndShare";
import PatientLinksProvider from "@/providers/PatientLinksProvider";
import { ConsentTypes } from "@/types/consent";

import { AppRoutes } from "./types";
import curaLogo from "/images/cura-logo.svg";

const PAGES_WITHOUT_SIDEBAR = ["/session-expired"];

const Routes: AppRoutes = {
  "/my-records": () => <Dashboard tab="linked" />,
  "/my-records/:tab": ({ tab }) => <Dashboard tab={tab} />,
  "/my-records/linked/:hip_id": ({ hip_id }) => (
    <MyRecordDetail hip_id={hip_id} />
  ),

  "/profile": () => <Profile />,

  "/consents": () => <Consent />,
  "/consents/:id/:type": ({ type, id }) => {
    if (Object.values(ConsentTypes).includes(type)) {
      return <ConsentDetail id={id} type={type} />;
    }
  },
  "/linked-facilities": () => <LinkedFacility />,
  "/linked-facilities/add": () => <AddFacility />,
  "/linked-facilities/:id": ({ id }) => <LinkedFacilityDetail id={id} />,
  "/linked-facilities/add/:id": ({ id }) => <AddFacilityDetail id={id} />,

  "/health-lockers": () => <HealthLocker />,
  "/health-lockers/:id": ({ id }) => <HealthLockerDetail id={id} />,

  "/notifications": () => <Notifications />,
  "/scan-and-share": () => <ScanAndShare />,

  "/": () => <Redirect to="/my-records/linked" />,
  "/login": () => <Redirect to="/my-records/linked" />,
  "/register": () => <Redirect to="/my-records/linked" />,

  "/session-expired": () => <SessionExpired />,
};

export default function PrivateRouter() {
  const pages = useRoutes(Routes) || <FallbackErrorPage />;

  const sidebarOpen = useSidebarState();
  const showSidebar = !PAGES_WITHOUT_SIDEBAR.includes(location.pathname);
  const isScanSharePage = location.pathname === "/scan-share";

  return (
    <PatientLinksProvider>
      <SidebarProvider defaultOpen={sidebarOpen} className="bg-gray-100">
        {showSidebar && <AppSidebar />}

        <main
          id="pages"
          className={`flex flex-col flex-1 max-w-full min-h-[calc(100svh-(--spacing(4)))] ${
            isScanSharePage
              ? "md:m-0 border-0 shadow-none"
              : "md:m-2 md:peer-data-[state=collapsed]:ml-0 border border-gray-200 rounded-lg shadow-sm"
          } bg-gray-50 focus:outline-hidden`}
        >
          {!isScanSharePage && (
            <div className="relative z-10 flex h-16 bg-white shadow-sm shrink-0 md:hidden">
              <div className="flex items-center">
                <SidebarTrigger />
              </div>
              <a className="flex items-center w-full h-full md:hidden">
                <img className="w-40" src={curaLogo} alt="cura logo" />
              </a>
            </div>
          )}
          <div className={isScanSharePage ? "" : "p-3 mt-4"} data-cui-page>
            <ErrorBoundary
              fallback={<FallbackErrorPage forError="PAGE_LOAD_ERROR" />}
            >
              {pages}
            </ErrorBoundary>
          </div>
        </main>
      </SidebarProvider>
    </PatientLinksProvider>
  );
}
