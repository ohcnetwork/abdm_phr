import { Calendar, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FileUploadReturn } from "@/hooks/useFileUpload";

import { FILE_ICONS, UploadedRecord } from "@/types/dashboard";
import dayjs from "@/utils/dayjs";

import UploadedRecordActions from "./UploadedRecordActions";

interface UploadedRecordListProps {
  files: UploadedRecord[];
  fileUpload: FileUploadReturn;
}

const getFileName = (file: UploadedRecord) =>
  file.name ? file.name + file.extension : "";

const FileRow = ({
  file,
  fileUpload,
  variant,
}: {
  file: UploadedRecord;
  fileUpload: FileUploadReturn;
  variant: "card" | "table";
}) => {
  const filetype = fileUpload.getFileType(file);
  const fileName = getFileName(file);
  const Icon = FILE_ICONS[filetype];

  const createdDate = dayjs(file.created_date).format("DD MMM YYYY, hh:mm A");
  const shortDate = dayjs(file.created_date).format("DD MMM YYYY");

  if (variant === "card") {
    return (
      <Card
        key={file.id}
        className="group overflow-hidden bg-white hover:shadow-md py-3"
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2.5 rounded-xl flex-shrink-0 bg-gray-50">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate text-base leading-tight">
                  {fileName}
                </h3>
                <div className="mt-1 flex items-center gap-1">
                  <FileText className="size-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {filetype}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <UploadedRecordActions file={file} fileUpload={fileUpload} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="size-4 text-gray-400" />
              <span className="font-medium">{shortDate}</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-500">
                  {dayjs(file.created_date).format("hh:mm A")}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-white">
                <p>Created: {createdDate}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TableRow
      key={file.id}
      className="shadow rounded-md overflow-hidden group hover:shadow-md transition-shadow"
    >
      <TableCell className="font-medium rounded-l-md group-hover:bg-gray-50 bg-white">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-full bg-gray-100 shrink-0">
            <Icon className="size-4" />
          </span>
          {fileName.length > 25 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-gray-900 truncate block">{fileName}</span>
              </TooltipTrigger>
              <TooltipContent className="text-white">{fileName}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-gray-900 truncate block">{fileName}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="group-hover:bg-gray-50 bg-white">
        {filetype}
      </TableCell>
      <TableCell className="group-hover:bg-gray-50 bg-white">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{createdDate}</span>
          </TooltipTrigger>
          <TooltipContent className="text-white">{createdDate}</TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="text-right rounded-r-md group-hover:bg-gray-50 bg-white">
        <UploadedRecordActions file={file} fileUpload={fileUpload} />
      </TableCell>
    </TableRow>
  );
};

const UploadedRecordList = ({ files, fileUpload }: UploadedRecordListProps) => {
  if (!files?.length) return null;

  return (
    <>
      <div className="hidden xl:block -mt-2">
        <Table className="border-separate border-spacing-y-3 mx-2 xl:max-w-[calc(100%-16px)]">
          <TableHeader>
            <TableRow className="shadow rounded overflow-hidden">
              <TableHead className="w-[40%] bg-white rounded-l">
                File Name
              </TableHead>
              <TableHead className="w-[20%] rounded-y bg-white">
                File Type
              </TableHead>
              <TableHead className="w-[25%] rounded-y bg-white">Date</TableHead>
              <TableHead className="w-[15%] text-center rounded-r bg-white">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                fileUpload={fileUpload}
                variant="table"
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="xl:hidden space-y-4 px-2">
        {files.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            fileUpload={fileUpload}
            variant="card"
          />
        ))}
      </div>
    </>
  );
};

export default UploadedRecordList;
