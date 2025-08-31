import { Building2, ChevronDown, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { usePatientLinks } from "@/hooks/usePatientLinks";

import {
  CONSENT_HI_TYPES_ICONS,
  ConsentHITypes,
  ConsentLinks,
} from "@/types/consent";
import { SubscriptionCategories } from "@/types/subscription";
import { formatReadableDateTime, toTitleCase } from "@/utils";

export function ConsentBasicDetails({
  requester,
  purpose,
  requestType,
}: {
  requester: string;
  purpose: string;
  requestType: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg">Basic Information</CardTitle>
        <CardDescription>
          Basic information about the consent request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Requester</p>
          <p className="text-base text-gray-900 font-medium">{requester}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Purpose of Request</p>
          <p className="text-base text-gray-900 font-medium">{purpose}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Request Type</p>
          <p className="text-base text-gray-900 font-medium">
            {toTitleCase(requestType)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConsentDurationDetails({
  fromDate,
  toDate,
  dataEraseAt,
}: {
  fromDate: string;
  toDate: string;
  dataEraseAt: string | undefined;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg">Consent Duration</CardTitle>
        <CardDescription>
          Duration information about the validity of the consent request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Valid From</p>
          <p className="text-base text-gray-900 font-medium">
            {formatReadableDateTime(fromDate, true)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Valid To</p>
          <p className="text-base text-gray-900 font-medium">
            {formatReadableDateTime(toDate, true)}
          </p>
        </div>
        {dataEraseAt && (
          <div>
            <p className="text-sm text-gray-500">Data Erasure Date</p>
            <p className="text-base text-gray-900 font-medium">
              {formatReadableDateTime(dataEraseAt, true)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ConsentHITypeDetails({ types }: { types: ConsentHITypes[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg">
          Requested Health Information Types
        </CardTitle>
        <CardDescription>
          These are the health information types that the requester has
          requested.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {types.map((type, index) => {
          const Icon = CONSENT_HI_TYPES_ICONS[type] || FileText;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-md border border-gray-200"
            >
              <Icon className="size-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-800">{type}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function SubscriptionCategoryDetails({
  categories,
}: {
  categories: SubscriptionCategories[];
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg">Subscription Categories</CardTitle>
        <CardDescription>
          These categories determine what type of information the HIU will
          receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-200"
          >
            <div
              className={cn(
                "size-2 mt-1 rounded-full",
                category === SubscriptionCategories.LINK
                  ? "bg-blue-500"
                  : "bg-primary",
              )}
            />
            <div>
              <p className="text-base font-medium text-gray-900">
                {toTitleCase(category)}
              </p>
              <p className="text-sm text-gray-600">
                {category === SubscriptionCategories.LINK
                  ? "Enables the HIU to receive notifications when new care contexts are linked to a patient."
                  : "Enables the HIU to receive health information for existing care contexts already linked to a patient."}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ConsentHIPDetails({
  showContexts,
  hips,
}: {
  showContexts: boolean;
  hips: ConsentLinks[];
}) {
  const { getHipName } = usePatientLinks();
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg">Health Information Providers</CardTitle>
        <CardDescription>
          These are the health information providers that the requester has
          requested.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hips.map((facility, index) => (
          <Collapsible key={index} disabled={!showContexts}>
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="size-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {facility.hip.name ||
                        getHipName(facility.hip.id) ||
                        "N/A"}
                    </span>
                    {showContexts && facility.careContexts && (
                      <p className="text-xs text-gray-500">
                        {facility.careContexts.length} care contexts available
                      </p>
                    )}
                  </div>
                </div>
                {showContexts && (
                  <ChevronDown className="size-4 text-gray-400 transition-transform data-[state=open]:rotate-180" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 border-t border-gray-50">
                {showContexts && facility.careContexts && (
                  <div className="pt-3 space-y-2">
                    {facility.careContexts.map((context, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-md"
                      >
                        <div className="size-2 bg-primary rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          {context.display || context.careContextReference}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
