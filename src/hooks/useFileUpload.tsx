import { useMutation, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import FilePreviewDialog, {
  StateInterface,
} from "@/components/dashboard/dialogs/FilePreviewDialog";
import FileRenameDialog from "@/components/dashboard/dialogs/FileRenameDialog";

import { useAuthContext } from "@/hooks/useAuth";

import {
  BACKEND_ALLOWED_EXTENSIONS,
  DEFAULT_MAX_FILE_SIZE,
  FILE_EXTENSIONS,
  PREVIEWABLE_FILE_EXTENSIONS,
} from "@/common/constants";

import routes from "@/api";
import { UploadedRecord } from "@/types/dashboard";
import { fileToBase64 } from "@/utils";
import { mutate, query } from "@/utils/request/request";

const PDF_CONFIG = {
  format: "JPEG" as const,
  x: 10,
  y: 10,
  width: 190,
  height: 0,
};

export type FileUploadOptions = {
  multiple?: boolean;
  type: string;
  category?: string;
  allowedExtensions?: string[];
  uploadedFiles?: UploadedRecord[];
  maxFileSize?: number;
  fileType?: "patient";
  fileCategory?: "unspecified";
};

export type FileUploadReturn = {
  progress: null | number;
  error: null | string;
  setError: (error: string | null) => void;
  getFileType: (
    file: UploadedRecord,
  ) => keyof typeof FILE_EXTENSIONS | "UNKNOWN";
  isPreviewable: (file: UploadedRecord) => boolean;
  validateFiles: () => boolean;
  handleFileUpload: (combineToPDF?: boolean) => Promise<void>;
  fileNames: string[];
  files: File[];
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setFileName: (names: string, index?: number) => void;
  setFileNames: (names: string[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  uploading: boolean;
  viewFile: (file: UploadedRecord) => Promise<void>;
  downloadFile: (file: UploadedRecord) => Promise<void>;
  editFile: (file: UploadedRecord) => void;
  Dialogs: React.ReactNode;
};

export default function useFileUpload(
  options: FileUploadOptions,
): FileUploadReturn {
  const {
    uploadedFiles,
    maxFileSize = DEFAULT_MAX_FILE_SIZE * 1024 * 1024,
    fileType = "patient" as const,
    fileCategory = "unspecified" as const,
  } = options;
  const { user } = useAuthContext();

  const [uploadFileNames, setUploadFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<null | number>(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [fileState, setFileState] = useState<StateInterface>({
    open: false,
    isImage: false,
    name: "",
    extension: "",
    isZoomInDisabled: false,
    isZoomOutDisabled: false,
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [downloadURL, setDownloadURL] = useState<string>("");

  const [editDialogOpen, setEditDialogOpen] = useState<UploadedRecord | null>(
    null,
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrl);
      }
      if (downloadURL && downloadURL.startsWith("blob:")) {
        URL.revokeObjectURL(downloadURL);
      }
    };
  }, [fileUrl, downloadURL]);

  const generatePDF = async (filesToConvert: File[]): Promise<File | null> => {
    const objectUrls: string[] = [];

    try {
      toast.info("File conversion in progress");
      const pdf = new jsPDF();
      const totalFiles = filesToConvert.length;

      for (const [index, file] of filesToConvert.entries()) {
        const imgData = URL.createObjectURL(file);
        objectUrls.push(imgData);

        pdf.addImage(
          imgData,
          PDF_CONFIG.format,
          PDF_CONFIG.x,
          PDF_CONFIG.y,
          PDF_CONFIG.width,
          PDF_CONFIG.height,
        );

        if (index < filesToConvert.length - 1) {
          pdf.addPage();
        }

        const currentProgress = Math.round(((index + 1) / totalFiles) * 100);
        setProgress(currentProgress);
      }

      const pdfBlob = pdf.output("blob");
      const pdfFile = new File([pdfBlob], "combined.pdf", {
        type: "application/pdf",
      });

      setProgress(100);
      toast.success("File conversion completed successfully");
      return pdfFile;
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
      setError("Failed to generate PDF. Please try again.");
      return null;
    } finally {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      setProgress(null);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files?.length) {
      return;
    }
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setError(null);
  };

  useEffect(() => {
    const blanks = Array(files.length).fill("");
    setUploadFileNames((names) => [...names, ...blanks].slice(0, files.length));
  }, [files]);

  const getFileType = (
    file: UploadedRecord,
  ): keyof typeof FILE_EXTENSIONS | "UNKNOWN" => {
    if (!file.extension) return "UNKNOWN";

    const fileExtension = file.extension.slice(1).toLowerCase();
    const fileType = (
      Object.keys(FILE_EXTENSIONS) as (keyof typeof FILE_EXTENSIONS)[]
    ).find((type) => FILE_EXTENSIONS[type].includes(fileExtension as never));

    return fileType || "UNKNOWN";
  };

  const isPreviewable = (file: UploadedRecord): boolean => {
    if (!file.extension) return false;

    const extension = file.extension.slice(1).toLowerCase();
    return PREVIEWABLE_FILE_EXTENSIONS.includes(
      extension as (typeof PREVIEWABLE_FILE_EXTENSIONS)[number],
    );
  };

  const getExtension = (url: string): string => {
    const urlWithoutQuery = url.split("?")[0];
    const parts = urlWithoutQuery.split(".");
    return parts[parts.length - 1].toLowerCase();
  };

  const handleFilePreviewClose = (): void => {
    if (downloadURL && downloadURL.startsWith("blob:")) {
      URL.revokeObjectURL(downloadURL);
    }
    setDownloadURL("");
    setFileState({
      ...fileState,
      open: false,
      isZoomInDisabled: false,
      isZoomOutDisabled: false,
    });
  };

  const validateFileUpload = (): boolean => {
    if (files.length === 0) {
      setError("Please choose at least one file");
      return false;
    }

    for (const [index, file] of files.entries()) {
      const fileName = file.name.trim();

      if (fileName.length === 0) {
        setError(`File ${index + 1}: File name cannot be empty`);
        return false;
      }

      if (file.size > maxFileSize) {
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        setError(`File "${fileName}": Size exceeds ${maxSizeMB}MB limit`);
        return false;
      }

      const extension = file.name.split(".").pop()?.toLowerCase();
      if (options.allowedExtensions && options.allowedExtensions.length > 0) {
        const normalizedAllowedExtensions = options.allowedExtensions.map(
          (ext) => ext.replace(".", "").toLowerCase(),
        );

        if (!extension || !normalizedAllowedExtensions.includes(extension)) {
          setError(
            `File "${fileName}": Type .${extension} is not allowed. Allowed types: ${options.allowedExtensions.join(", ")}`,
          );
          return false;
        }
      }
    }

    return true;
  };

  const validateFileNames = (combineToPDF: boolean): boolean => {
    if (combineToPDF) {
      if (!uploadFileNames.length || !uploadFileNames[0]?.trim()) {
        setError("Please enter a name for the combined PDF file");
        return false;
      }
    } else {
      for (const fileName of uploadFileNames) {
        if (!fileName?.trim()) {
          setError(`Please give a name for the file`);
          return false;
        }
      }
    }
    return true;
  };

  const { mutateAsync: createUpload } = useMutation({
    mutationFn: mutate(routes.dashboard.createUploadedRecord),
  });

  const handleUpload = async (combineToPDF?: boolean): Promise<void> => {
    const uploadOptions = { ...options };

    if (combineToPDF) {
      uploadOptions.allowedExtensions = ["jpg", "png", "jpeg"];
    }

    if (!validateFileUpload() || !validateFileNames(!!combineToPDF)) {
      return;
    }

    setProgress(0);
    setUploading(true);
    setError(null);

    let filesToUpload = [...files];
    const failedFiles: File[] = [];
    const failedFileNames: string[] = [];

    try {
      if (combineToPDF && files.length > 1) {
        const pdfFile = await generatePDF(files);
        if (!pdfFile) {
          setError("Failed to generate PDF. Please try again.");
          return;
        }
        filesToUpload = [pdfFile];
      }

      for (const [index, file] of filesToUpload.entries()) {
        try {
          await createUpload({
            file_data: await fileToBase64(file),
            original_name: file.name,
            name: uploadFileNames[index] || file.name,
            associating_id: user?.abhaAddress || "",
            file_type: fileType,
            file_category: fileCategory,
            mime_type: file.type,
          });

          const uploadProgress = Math.round(
            ((index + 1) / filesToUpload.length) * 100,
          );
          setProgress(uploadProgress);
        } catch (uploadError) {
          console.error(`Failed to upload file ${file.name}:`, uploadError);
          failedFiles.push(file);
          failedFileNames.push(uploadFileNames[index] || file.name);
        }
      }

      if (failedFiles.length === 0) {
        toast.success(`Successfully uploaded ${filesToUpload.length} file(s)`);
        clearFiles();
      } else {
        const successCount = filesToUpload.length - failedFiles.length;
        if (successCount > 0) {
          toast.success(`Successfully uploaded ${successCount} file(s)`);
        }

        setFiles(failedFiles);
        setUploadFileNames(failedFileNames);
        setError(
          `Failed to upload ${failedFiles.length} file(s). Please try again.`,
        );
      }

      if (failedFiles.length < filesToUpload.length) {
        queryClient.invalidateQueries({
          queryKey: ["uploadedRecords"],
        });
      }
    } catch (error) {
      console.error("Upload process failed:", error);
      setError("Upload failed due to an unexpected error. Please try again.");
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const clearFiles = (): void => {
    setFiles([]);
    setError(null);
    setUploadFileNames([]);
    setProgress(null);
  };

  const getUploadedRecord = async (file: UploadedRecord) => {
    if (!file.id) {
      throw new Error("File ID is required");
    }

    return queryClient.fetchQuery({
      queryKey: ["uploadedRecord", file.id],
      queryFn: query(routes.dashboard.getUploadedRecord, {
        queryParams: {
          file_type: fileType,
          associating_id: user?.abhaAddress || "",
        },
        pathParams: { id: file.id },
      }),
    });
  };

  const viewFile = async (file: UploadedRecord): Promise<void> => {
    try {
      const index = uploadedFiles?.findIndex((f) => f.id === file.id) ?? -1;
      setCurrentIndex(index);
      setFileUrl("");
      setFileState({ ...fileState, open: true });

      const data = await getUploadedRecord(file);
      if (!data?.read_signed_url) {
        throw new Error("Unable to get file URL");
      }

      const signedUrl = data.read_signed_url as string;
      const extension = getExtension(signedUrl);

      setFileState({
        ...fileState,
        open: true,
        name: data.name as string,
        extension,
        isImage: FILE_EXTENSIONS.IMAGE.includes(
          extension as (typeof FILE_EXTENSIONS.IMAGE)[number],
        ),
      });
      setDownloadURL(signedUrl);
      setFileUrl(signedUrl);
    } catch (error) {
      console.error("Failed to view file:", error);
      toast.error("Failed to load file preview");
    }
  };

  const downloadFile = async (file: UploadedRecord): Promise<void> => {
    if (!file.id) {
      toast.error("Invalid file");
      return;
    }

    try {
      toast.success("Downloading file...");

      const fileData = await getUploadedRecord(file);
      if (!fileData?.read_signed_url) {
        throw new Error("Unable to get download URL");
      }

      const response = await fetch(fileData.read_signed_url);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await response.blob();
      const blobUrl = URL.createObjectURL(data);

      const a = document.createElement("a");
      a.href = blobUrl;

      let fileName = file.name || "downloaded-file";
      if (file.extension && !fileName.endsWith(file.extension)) {
        fileName = `${fileName}.${file.extension.replace(".", "")}`;
      } else if (!file.extension) {
        const urlExtension = getExtension(fileData.read_signed_url);
        if (urlExtension && BACKEND_ALLOWED_EXTENSIONS.includes(urlExtension)) {
          fileName = `${fileName}.${urlExtension}`;
        }
      }
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("File download failed:", error);
      toast.error("File download failed. Please try again.");
    }
  };

  const editFile = (file: UploadedRecord): void => {
    setEditDialogOpen(file);
  };

  const Dialogs = (
    <>
      <FileRenameDialog
        editedFile={editDialogOpen}
        setEditedFile={setEditDialogOpen}
      />
      <FilePreviewDialog
        show={fileState.open}
        fileUrl={fileUrl}
        file_state={fileState}
        downloadURL={downloadURL}
        uploadedFiles={uploadedFiles}
        onClose={handleFilePreviewClose}
        className="h-[80vh] w-full md:h-screen"
        loadFile={viewFile}
        currentIndex={currentIndex}
      />
    </>
  );

  return {
    progress,
    error,
    setError,
    validateFiles: validateFileUpload,
    handleFileUpload: handleUpload,
    fileNames: uploadFileNames,
    files,
    onFileChange,
    setFileNames: setUploadFileNames,
    setFileName: (name: string, index = 0) => {
      setUploadFileNames((prevNames) =>
        prevNames.map((n, i) => (i === index ? name : n)),
      );
    },
    removeFile: (index = 0) => {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
      setUploadFileNames((prevNames) =>
        prevNames.filter((_, i) => i !== index),
      );
    },
    clearFiles,
    uploading,
    getFileType,
    isPreviewable,
    viewFile,
    downloadFile,
    editFile,
    Dialogs,
  };
}
