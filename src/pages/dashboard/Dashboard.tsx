import { navigate } from "raviger";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Page from "@/components/common/Page";

import LinkedRecords from "./LinkedRecords";
import UploadedRecords from "./UploadedRecords";

interface DashboardProps {
  tab: string;
}

const Dashboard = ({ tab = "linked" }: DashboardProps) => {
  const tabTriggerClass =
    "border-b-2 px-2 sm:px-4 py-2 sm:max-w-[130px] text-gray-600 hover:text-gray-900 data-[state=active]:border-b-primary-700  data-[state=active]:text-primary-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none";

  return (
    <Page title="My Records" hideTitleOnPage>
      <div className="space-y-4 mb-6 mt-2">
        <div>
          <h1 className="text-2xl font-bold">My Records</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your health records
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(value) => navigate(`/my-records/${value}`)}
        >
          <TabsList className="w-full justify-evenly sm:justify-start border-b rounded-none bg-transparent p-0 h-auto overflow-x-auto">
            <TabsTrigger className={tabTriggerClass} value="linked">
              Linked
            </TabsTrigger>
            <TabsTrigger className={tabTriggerClass} value="uploaded">
              Uploaded
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="linked">
              <LinkedRecords />
            </TabsContent>

            <TabsContent value="uploaded">
              <UploadedRecords />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Page>
  );
};

export default Dashboard;
