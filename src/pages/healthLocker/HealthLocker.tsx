import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import Page from "@/components/common/Page";
import AddHealthLockerSheet from "@/components/healthLocker/AddHealthLockerSheet";
import HealthLockerCard from "@/components/healthLocker/HealthLockerCard";

import { CardGridSkeleton } from "@/common/loaders/SkeletonLoader";

import routes from "@/api";
import { query } from "@/utils/request/request";

function HealthLockerHeader({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">
          Health Lockers
        </h1>

        <p className="text-gray-600 text-sm">
          View and manage your health lockers
        </p>
      </div>
      <Button variant="outline" className="gap-3" onClick={onAddClick}>
        <Plus />
        Add Health Locker
      </Button>
    </div>
  );
}

export default function HealthLocker() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["patientLockers"],
    queryFn: query(routes.healthLocker.listPatientLockers),
  });

  const [open, setOpen] = useState(false);

  return (
    <Page title="Health Lockers" hideTitleOnPage>
      <div className="w-full mx-auto mt-2">
        <HealthLockerHeader onAddClick={() => setOpen(true)} />

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CardGridSkeleton count={4} />
          </div>
        )}

        {(isError || !data || data.length === 0) && !isLoading && (
          <EmptyState
            icon={FolderOpen}
            title="No health lockers found"
            description="Register a new health locker to get started"
          />
        )}

        {data && data.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((locker) => (
              <HealthLockerCard key={locker.lockerId} data={locker} />
            ))}
          </div>
        )}

        <AddHealthLockerSheet
          open={open}
          setOpen={setOpen}
          existingLockers={data || []}
        />
      </div>
    </Page>
  );
}
