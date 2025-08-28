import { ArrowRight, FolderLock } from "lucide-react";
import { navigate } from "raviger";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PatientLockerBasic } from "@/types/healthLocker";
import { formatReadableDateTime } from "@/utils";

interface HealthLockerCardProps {
  data: PatientLockerBasic;
}

export default function HealthLockerCard({ data }: HealthLockerCardProps) {
  const handleView = () => {
    navigate(`/health-lockers/${data.lockerId}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
              {data.lockerName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FolderLock className="size-4" />
              <span>Health Locker</span>
            </div>
          </div>

          <Badge
            variant={data.isActive ? "primary" : "destructive"}
            className="flex-shrink-0"
          >
            {data.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {formatReadableDateTime(data.dateCreated, true)}
          </div>

          <Button
            onClick={handleView}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            View
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
