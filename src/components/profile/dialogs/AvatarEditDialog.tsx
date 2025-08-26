import DOMPurify from "dompurify";
import { CloudUpload, Crop, Loader2 } from "lucide-react";
import { ChangeEventHandler, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import useDragAndDrop from "@/hooks/useDragAndDrop";

import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_KB } from "@/common/constants";

import { getCroppedImg } from "@/utils/getCroppedImg";

interface AvatarEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoUpdate: (profilePhoto: string) => void;
  currentImageUrl?: string;
  isLoading: boolean;
  aspectRatio: number;
}

const isImageFile = (file?: File) =>
  file && ALLOWED_IMAGE_TYPES.includes(file.type);

export default function AvatarEditModal({
  open,
  onOpenChange,
  onPhotoUpdate,
  currentImageUrl,
  aspectRatio = 1,
  isLoading,
}: AvatarEditModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCroppedPreview, setShowCroppedPreview] = useState(false);

  const MAX_FILE_SIZE = MAX_FILE_SIZE_KB * 1024;

  const resetModalState = () => {
    setPreview(undefined);
    setIsProcessing(false);
    setSelectedFile(undefined);
    setCroppedAreaPixels(null);
    setCroppedPreview(null);
    setShowCroppedPreview(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    dragProps.setFileDropError("");
  };

  const handleCloseModal = () => {
    resetModalState();
    onOpenChange(false);
  };

  useEffect(() => {
    if (!isImageFile(selectedFile)) {
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile!);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileSelect: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    const file = e.target.files[0];

    if (!isImageFile(file)) {
      toast.error("Please select a valid image file (JPG, JPEG, or PNG)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image size should be less than ${MAX_FILE_SIZE_KB}KB`);
      return;
    }

    setSelectedFile(file);
    setShowCroppedPreview(false);
  };

  const handleCropImage = async () => {
    if (!croppedAreaPixels || !preview) return;

    try {
      setIsProcessing(true);
      const { file, previewUrl } = await getCroppedImg(
        preview,
        croppedAreaPixels,
        aspectRatio,
      );
      setSelectedFile(file);
      setCroppedPreview(previewUrl);
      setShowCroppedPreview(true);
      toast.success("Image cropped successfully");
    } catch (error) {
      toast.error("Failed to crop image. Using original image.");
      console.error("Crop error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadPhoto = async () => {
    if (!croppedPreview) {
      handleCloseModal();
      return;
    }

    try {
      const base64 = croppedPreview.split(",")[1];
      onPhotoUpdate(base64);
    } catch (error) {
      toast.error("Failed to process image");
      console.error("Upload error:", error);
    }
  };

  const dragProps = useDragAndDrop();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragProps.setDragOver(false);
    setIsDragging(false);

    const droppedFile = e?.dataTransfer?.files[0];

    if (!isImageFile(droppedFile)) {
      dragProps.setFileDropError(
        "Please upload a valid image file (JPG, JPEG, or PNG)",
      );
      return;
    }

    if (droppedFile.size > MAX_FILE_SIZE) {
      dragProps.setFileDropError(
        `Image size should be less than ${MAX_FILE_SIZE_KB}KB`,
      );
      return;
    }

    setSelectedFile(droppedFile);
    dragProps.setFileDropError("");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragProps.onDragOver(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragProps.onDragLeave();
    setIsDragging(false);
  };

  const fileRequirements = (
    <div className="text-center font-medium text-secondary-700 mt-2 space-y-1">
      <p> Image size should be less than {MAX_FILE_SIZE_KB}KB</p>
      <p>
        Allowed formats: JPG, JPEG, PNG, Recommended aspect ratio:{" "}
        {aspectRatio === 1 ? "1:1 (square)" : "16:9 (video)"}
      </p>
    </div>
  );

  const isUploadDisabled =
    isLoading ||
    isProcessing ||
    !selectedFile ||
    (!croppedAreaPixels && !showCroppedPreview);

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="md:max-w-4xl max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="flex h-full w-full items-center justify-center overflow-y-auto">
          <div className="flex max-h-screen w-full flex-col overflow-auto">
            {preview ? (
              <>
                {!showCroppedPreview ? (
                  <>
                    <div className="relative w-full h-[400px]">
                      <Cropper
                        image={
                          preview && preview.startsWith("blob:")
                            ? DOMPurify.sanitize(preview)
                            : preview
                        }
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onCropComplete={(
                          _croppedArea: Area,
                          croppedAreaPixels: Area,
                        ) => {
                          setCroppedAreaPixels(croppedAreaPixels);
                        }}
                        onZoomChange={setZoom}
                        minZoom={0.1}
                        maxZoom={3}
                      />
                    </div>
                    {fileRequirements}
                  </>
                ) : (
                  <>
                    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                      {croppedPreview ? (
                        <img
                          src={croppedPreview}
                          alt="Cropped preview"
                          loading="lazy"
                          decoding="async"
                          className={cn(
                            "max-w-full max-h-full object-contain rounded-lg",
                            aspectRatio === 1
                              ? "aspect-square"
                              : aspectRatio === 16 / 9
                                ? "aspect-video"
                                : "",
                          )}
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <p className="text-sm">No preview available</p>
                        </div>
                      )}
                    </div>
                    <p className="text-center font-medium text-secondary-700 mt-2">
                      Preview of cropped image
                    </p>
                  </>
                )}
              </>
            ) : currentImageUrl ? (
              <div className="w-full h-[400px] rounded-lg flex items-center justify-center">
                <img
                  src={currentImageUrl}
                  alt="Current profile"
                  className={cn(
                    "w-full max-w-[400px] max-h-[400px] mx-auto object-cover",
                    aspectRatio === 1 && "aspect-square",
                  )}
                />
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "mt-8 flex flex-1 flex-col items-center justify-center rounded-lg border-[3px] border-dashed px-3 py-6 min-h-[300px]",
                  {
                    "border-primary-800 bg-primary-100": isDragging,
                    "border-primary-500": !isDragging && dragProps.dragOver,
                    "border-gray-300":
                      !isDragging &&
                      !dragProps.dragOver &&
                      !dragProps.fileDropError,
                    "border-red-500": dragProps.fileDropError !== "",
                  },
                )}
              >
                <CloudUpload
                  className={cn("size-12 mb-4", {
                    "text-primary-500": isDragging || dragProps.dragOver,
                    "text-gray-400":
                      !isDragging &&
                      !dragProps.dragOver &&
                      !dragProps.fileDropError,
                    "text-red-500": dragProps.fileDropError !== "",
                  })}
                />
                <p
                  className={cn("text-sm font-medium mb-2", {
                    "text-primary-500": dragProps.dragOver,
                    "text-red-500": dragProps.fileDropError !== "",
                    "text-secondary-700":
                      !dragProps.dragOver && dragProps.fileDropError === "",
                  })}
                >
                  {dragProps.fileDropError !== ""
                    ? dragProps.fileDropError
                    : "Drag and drop your image here"}
                </p>
                {fileRequirements}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-4 sm:flex-row">
              <Button variant="primary" className="w-full sm:w-auto" asChild>
                <label className="cursor-pointer">
                  <CloudUpload className="mr-2 size-4" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </Button>

              <div className="sm:flex-1"></div>
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={isLoading || isProcessing}
              >
                Cancel
              </Button>

              <Button
                onClick={
                  showCroppedPreview ? handleUploadPhoto : handleCropImage
                }
                disabled={isUploadDisabled}
                variant={showCroppedPreview ? "primary" : "outline"}
              >
                {isLoading || isProcessing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : showCroppedPreview ? (
                  <CloudUpload className="mr-2 size-4" />
                ) : (
                  <Crop className="mr-2 size-4" />
                )}
                {isLoading
                  ? "Uploading..."
                  : isProcessing
                    ? "Processing..."
                    : showCroppedPreview
                      ? "Save Photo"
                      : "Crop Image"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
