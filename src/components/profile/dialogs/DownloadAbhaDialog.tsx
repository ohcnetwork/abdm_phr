import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import routes from "@/api";
import { query } from "@/utils/request/request";

type DownloadAbhaProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const DownloadAbha = ({ open, setOpen }: DownloadAbhaProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    data: abhaCardBlob,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["abhaCard"],
    queryFn: query(routes.profile.abhaCard),
    enabled: open,
  });

  useEffect(() => {
    if (abhaCardBlob) {
      setPreviewUrl(URL.createObjectURL(abhaCardBlob));
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [abhaCardBlob]);

  const handleDownload = () => {
    if (!previewUrl) return;
    try {
      const link = document.createElement("a");
      link.href = previewUrl;
      link.download = `abha-card-${new Date().toISOString().split("T")[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("ABHA card downloaded successfully!");
      setOpen(false);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download ABHA card.");
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return <Skeleton className="w-full h-[50vh] rounded-md" />;
    }

    if (error || !previewUrl) {
      return (
        <div className="w-full h-[50vh] flex items-center justify-center bg-gray-100 rounded-md">
          <p className="text-gray-500">Unable to load ABHA card</p>
        </div>
      );
    }

    return (
      <img
        src={previewUrl}
        alt="ABHA Card"
        className="w-full h-[50vh] sm:h-[70vh] object-cover rounded-md shadow-sm"
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95%] max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Download ABHA Card</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Loading your ABHA card..."
              : "View and download your ABHA card below."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2">{renderBody()}</div>

        <DialogFooter className="px-6 pb-6">
          {error || !previewUrl ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          ) : (
            <Button className="w-full" onClick={handleDownload}>
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadAbha;
