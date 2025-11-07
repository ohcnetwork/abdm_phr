import { useQuery } from "@tanstack/react-query";
import { HIProfile } from "hi-profiles";
import { AlertCircle, Archive, ArrowLeft, FileText } from "lucide-react";
import { navigate } from "raviger";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import Page from "@/components/common/Page";

import { usePatientLinks } from "@/hooks/usePatientLinks";

import { CardGridSkeleton } from "@/common/loaders/SkeletonLoader";

import routes from "@/api";
import { query } from "@/utils/request/request";

interface LinkedRecordDetailProps {
  hip_id: string;
}

interface ArchiveError {
  is_archived: boolean;
  archived_time: string;
  archived_reason: string;
}

function isArchiveError(err: unknown): err is ArchiveError {
  return (
    typeof err === "object" &&
    err !== null &&
    "is_archived" in err &&
    "archived_time" in err &&
    "archived_reason" in err
  );
}

function LinkedRecordDetailHeader({
  recordCount,
  hip_id,
}: {
  hip_id: string;
  recordCount?: number;
}) {
  const { getHipName } = usePatientLinks();
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/my-records/linked")}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="size-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {getHipName(hip_id) || "Linked Facility"}
          </h1>
          {recordCount && recordCount > 0 && (
            <p className="text-muted-foreground">
              {recordCount} {recordCount === 1 ? "record" : "records"} available
            </p>
          )}
        </div>
      </div>

      <Separator />
    </div>
  );
}

function ArchivedRecordCard({ error }: { error: ArchiveError }) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Archive className="size-5" />
          Record Archived
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-orange-700">
        <p className="text-sm">
          This record has been archived and is no longer accessible.
        </p>
        <div className="space-y-1 text-xs">
          <p>
            <strong>Archived on:</strong>{" "}
            {new Date(error.archived_time).toLocaleString()}
          </p>
          <p>
            <strong>Reason:</strong> {error.archived_reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorFallback() {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertCircle className="size-5" />
          Record Not Available
        </CardTitle>
      </CardHeader>
      <CardContent className="text-red-700">
        <p className="text-sm">
          The health record could not be fetched. Please try again later.
        </p>
        <p className="text-xs mt-2 text-red-600">Status: Waiting for record</p>
      </CardContent>
    </Card>
  );
}

const LinkedRecordDetail = ({ hip_id }: LinkedRecordDetailProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["linkedRecordDetail", hip_id],
    queryFn: query(routes.dashboard.getLinkedRecord, {
      pathParams: { id: hip_id },
    }),
    enabled: !!hip_id,
  });

  const archiveError = isArchiveError(error) ? error : null;

  const parseHealthData = (content: string) => {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse health record content:", e);
      return null;
    }
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Page title="Health Record" hideTitleOnPage>
      <div className="container mx-auto max-w-4xl space-y-6">
        <LinkedRecordDetailHeader
          recordCount={data?.data?.length}
          hip_id={hip_id}
        />
        {children}
      </div>
    </Page>
  );

  if (isLoading) {
    return (
      <Wrapper>
        <CardGridSkeleton count={4} />
      </Wrapper>
    );
  }

  if (archiveError) {
    return (
      <Wrapper>
        <ArchivedRecordCard error={archiveError} />
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <ErrorFallback />
      </Wrapper>
    );
  }

  if (data && (!data.data || data.data.length === 0)) {
    return (
      <Wrapper>
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
            <p className="text-muted-foreground">
              No health records are available for this request.
            </p>
          </CardContent>
        </Card>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="space-y-6">
        <div className="space-y-4">
          {data?.data?.map((record) => {
            const parsedData = parseHealthData(record.content);

            if (!parsedData) {
              return (
                <Card
                  key={record.care_context_reference}
                  className="border-yellow-200 bg-yellow-50"
                >
                  <CardContent className="pt-6">
                    <p className="text-yellow-800 text-sm">
                      Unable to display this record due to formatting issues.
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Reference: {record.care_context_reference}
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <HIProfile
                key={record.care_context_reference}
                bundle={parsedData}
              />
            );
          })}
        </div>
      </div>
    </Wrapper>
  );
};

export default LinkedRecordDetail;
