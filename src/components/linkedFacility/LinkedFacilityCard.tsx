import { ExternalLink, Hospital } from "lucide-react";
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
    <Link href={`/linked-facilities/${data.hip.id}`} className="block group">
      <Card className="h-full hover:shadow-md rounded-xl shadow-sm">
        <CardHeader className="pb-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex-shrink-0">
                <Hospital className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {data.hip.name}
                </CardTitle>
              </div>
            </div>
            <ExternalLink className="size-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Patient ID
              </span>
              <Badge variant="blue" className="text-xs">
                {recordCount}{" "}
                {recordCount === 1 ? "Care Context" : "Care Contexts"}
              </Badge>
            </div>
            <p className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded border">
              {data.careContexts[0].patientReference}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
