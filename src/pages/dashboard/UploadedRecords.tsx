import { useQuery } from "@tanstack/react-query";
import { FolderOpen, SearchIcon, UploadIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Pagination from "@/components/common/Pagination";
import UploadedRecordList from "@/components/dashboard/UploadedRecordList";
import FileUploadDialog from "@/components/dashboard/dialogs/FileUploadDialog";

import { useAuthContext } from "@/hooks/useAuth";
import useFileUpload from "@/hooks/useFileUpload";
import { useQueryParams } from "@/hooks/useQueryParams";

import { BACKEND_ALLOWED_EXTENSIONS } from "@/common/constants";
import {
  CardGridSkeleton,
  CardListSkeleton,
} from "@/common/loaders/SkeletonLoader";

import routes from "@/api/";
import { query } from "@/utils/request/request";

export const UPLOADED_RECORDS_LIMIT = 15;

const UploadedRecords = () => {
  const { user } = useAuthContext();
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const { params, updateQuery } = useQueryParams({
    limit: UPLOADED_RECORDS_LIMIT,
  });

  const {
    data: files,
    isLoading: filesLoading,
    error,
  } = useQuery({
    queryKey: ["uploadedRecords", params],
    queryFn: query.debounced(routes.dashboard.listUploadedRecords, {
      queryParams: {
        file_type: "patient",
        associating_id: user?.abhaAddress || "",
        name: params.name,
        limit: params.limit,
        offset: ((params.page ?? 1) - 1) * UPLOADED_RECORDS_LIMIT,
        ordering: "-modified_date",
      },
    }),
  });

  const fileUpload = useFileUpload({
    type: "patient",
    multiple: true,
    allowedExtensions: BACKEND_ALLOWED_EXTENSIONS,
    uploadedFiles: files?.results?.slice().reverse() || [],
  });

  useEffect(() => {
    if (fileUpload.files.length > 0) {
      setOpenUploadDialog(true);
    } else {
      setOpenUploadDialog(false);
    }
  }, [fileUpload.files]);

  useEffect(() => {
    if (!openUploadDialog) {
      fileUpload.clearFiles();
    }
  }, [openUploadDialog]);

  const isEmpty =
    !filesLoading && (!files?.results || files.results.length === 0);
  const isError = !!error;
  const totalCount = files?.count || 0;

  return (
    <div className="space-y-4">
      {fileUpload.Dialogs}
      <FileUploadDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
        fileUpload={fileUpload}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-72 sm:max-w-96 ml-2">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
          <Input
            id="search-by-filename"
            name="name"
            placeholder="Search files..."
            value={params.name}
            onChange={(e) => updateQuery({ name: e.target.value })}
            className="pointer-events-auto pl-10 bg-white"
          />
        </div>

        <div className="ml-auto">
          <Label
            htmlFor="file_upload"
            className="inline-flex items-center gap-2 cursor-pointer rounded-md bg-primary-600 px-4 py-2.5 text-white font-medium shadow hover:bg-primary-700 transition"
          >
            <UploadIcon className="size-4" />
            <span>Upload Files</span>
          </Label>
          <input
            id="file_upload"
            title="Upload File"
            onChange={fileUpload.onFileChange}
            type="file"
            multiple={true}
            accept={BACKEND_ALLOWED_EXTENSIONS.map((e) => "." + e).join(",")}
            hidden={true}
          />
        </div>
      </div>

      {filesLoading && (
        <>
          <div className="space-y-4 xl:hidden">
            <CardGridSkeleton count={4} />
          </div>
          <div className="space-y-4 xl:block">
            <CardListSkeleton count={4} />
          </div>
        </>
      )}

      {(isEmpty || isError) && !filesLoading && (
        <EmptyState
          icon={FolderOpen}
          title={isError ? "Failed to load files" : "No files found"}
          description={
            isError
              ? "Please try again or contact support if the problem persists"
              : params.name
                ? "Try adjusting your search criteria"
                : "Upload your first file to get started"
          }
        />
      )}

      {files?.results && files.results.length > 0 && !filesLoading && (
        <UploadedRecordList files={files.results} fileUpload={fileUpload} />
      )}

      {totalCount > UPLOADED_RECORDS_LIMIT && !filesLoading && (
        <div className="flex justify-center">
          <Pagination
            data={{ totalCount }}
            onChange={(page) => {
              updateQuery({
                page,
              });
            }}
            defaultPerPage={UPLOADED_RECORDS_LIMIT}
            cPage={params.page}
          />
        </div>
      )}
    </div>
  );
};

export default UploadedRecords;
