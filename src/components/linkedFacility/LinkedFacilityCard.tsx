import { Hospital } from "lucide-react";
import { Link } from "raviger";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PatientLink } from "@/types/gateway";

interface LinkedFacilityCardProps {
  data: PatientLink;
}

export default function LinkedFacilityCard({ data }: LinkedFacilityCardProps) {
  const recordCount = data.careContexts.length;

  return (
    <Link href={`/linked-facilities/${data.hip.id}`} className="block">
      <Card className="h-full hover:shadow-md transition-shadow rounded-xl border hover:border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <div className="p-2.5 bg-primary-50 rounded-lg flex-shrink-0">
              <Hospital className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                {data.hip.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Patient Reference
              </span>
              <Badge variant="outline" className="text-xs">
                {recordCount} {recordCount === 1 ? "Context" : "Contexts"}
              </Badge>
            </div>

            <div className="bg-gray-50 px-3 py-2 rounded-lg border">
              <p className="text-sm font-mono text-gray-700">
                {data.careContexts[0].patientReference}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
