import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  Camera,
  Clock,
  Loader2,
  MonitorCheck,
  Ticket,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuthContext } from "@/hooks/useAuth";

import routes from "@/api";
import type {
  ScanAndShareToken,
  SharePatientProfileRequest,
} from "@/types/gateway";
import dayjs from "@/utils/dayjs";
import { mutate, query } from "@/utils/request/request";

type ParsedScan = {
  hipId: string;
  counterId: string;
};

function parseScannedText(text: string): ParsedScan | null {
  try {
    const url = new URL(text);
    if (url.pathname !== "/share-profile") return null;
    const hipId =
      url.searchParams.get("hip-id") ?? url.searchParams.get("hip_id");
    const counterId =
      url.searchParams.get("counter-id") ?? url.searchParams.get("counter_id");
    if (!hipId || !counterId) return null;
    return { hipId, counterId };
  } catch {
    return null;
  }
}

export default function Scan() {
  const { user } = useAuthContext();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanText, setScanText] = useState<string>("");
  const parsed = useMemo(() => parseScannedText(scanText), [scanText]);
  const [coords, setCoords] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    | (ScanAndShareToken & {
        remainingSeconds: number;
        isActive: boolean;
      })
    | null
  >(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        setCoords({});
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const { data: allTokens } = useQuery({
    queryKey: ["allShareTokens"],
    queryFn: query(routes.gateway.listSharedProfileTokens, { silent: true }),
  });

  const processedTokens = useMemo(() => {
    if (!allTokens) return [];
    const now = dayjs();

    return allTokens.map((token: ScanAndShareToken) => {
      const created = dayjs(token.dateCreated);
      const expiresInSeconds = parseInt(token.expiresIn, 10);
      const expiryTime = created.add(expiresInSeconds, "second");
      const remainingSeconds = expiryTime.diff(now, "second");
      const isActive = expiryTime.isAfter(now);

      return {
        ...token,
        remainingSeconds,
        expiryTime,
        isActive,
      };
    });
  }, [allTokens]);

  useEffect(() => {
    if (!parsed || !processedTokens.length) return;

    const activeMatchingToken = processedTokens.find(
      (token) => token.isActive && token.hipId === parsed.hipId,
    );

    if (activeMatchingToken) {
      setSelectedToken(activeMatchingToken);
      setShowTokenModal(true);
      setShowConsentModal(false);
    } else {
      setShowConsentModal(true);
      setShowTokenModal(false);
    }
  }, [parsed, processedTokens]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stop = false;

    async function start() {
      try {
        if (!videoRef.current) return;
        setStarted(true);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        // Camera successfully started; clear any prior error message
        setError(null);

        // Prefer BarcodeDetector if supported
        const hasBarcodeDetector =
          typeof window !== "undefined" && !!(window as any).BarcodeDetector;
        const formats: string[] = hasBarcodeDetector
          ? await (window as any).BarcodeDetector.getSupportedFormats?.()
          : [];
        const detector: any =
          hasBarcodeDetector && formats?.includes("qr_code")
            ? new (window as any).BarcodeDetector({ formats: ["qr_code"] })
            : null;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const tick = async () => {
          if (stop || !videoRef.current) return;
          if (detector && ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            try {
              const codes = await (detector as any).detect(canvas);
              if (codes && codes[0]?.rawValue) {
                setScanText(codes[0].rawValue);
                stop = true;
                if (stream) stream.getTracks().forEach((t) => t.stop());
                return;
              }
            } catch {
              // ignore and continue
            }
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } catch (_err) {
        setError("Camera access failed. You can paste the QR URL below.");
      }
    }
    start();
    return () => {
      stop = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const {
    mutate: shareProfile,
    isPending: isSharing,
    isSuccess: isShareSuccessful,
    reset: resetShareMutation,
  } = useMutation({
    mutationFn: mutate(routes.gateway.sharePatientProfile),
  });

  // Reset mutation when a new scan is detected
  useEffect(() => {
    if (parsed) {
      resetShareMutation();
    }
  }, [parsed, resetShareMutation]);

  const pollingEnabled = isShareSuccessful && !!parsed && !isSharing;

  const { data: tokens } = useQuery({
    queryKey: ["shareTokens"],
    queryFn: query(routes.gateway.listSharedProfileTokens, { silent: true }),
    refetchInterval: pollingEnabled ? 2000 : false,
    enabled: pollingEnabled,
  });

  const processedPollingTokens = useMemo(() => {
    if (!tokens) return [];
    const now = dayjs();

    return tokens.map((token: ScanAndShareToken) => {
      const created = dayjs(token.dateCreated);
      const expiresInSeconds = parseInt(token.expiresIn, 10);
      const expiryTime = created.add(expiresInSeconds, "second");
      const remainingSeconds = expiryTime.diff(now, "second");
      const isActive = expiryTime.isAfter(now);

      return {
        ...token,
        remainingSeconds,
        expiryTime,
        isActive,
      };
    });
  }, [tokens]);

  const matchingRequest = useMemo(() => {
    if (!processedPollingTokens || !parsed) return undefined;
    return processedPollingTokens.find(
      (t) =>
        t.isActive &&
        t.hipId === parsed.hipId &&
        t.counterCode === parsed.counterId,
    );
  }, [processedPollingTokens, parsed]);

  useEffect(() => {
    if (matchingRequest) {
      setSelectedToken(matchingRequest);
      setShowTokenModal(true);
      setShowConsentModal(false);
      resetShareMutation(); // Stop polling when match is found
    }
  }, [matchingRequest, resetShareMutation]);

  const handleAgree = () => {
    if (!parsed) return;
    const body: SharePatientProfileRequest = {
      hip_id: parsed.hipId,
      context: parsed.counterId,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
    shareProfile(body);
  };

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="relative overflow-hidden rounded-lg bg-black aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          {!started && (
            <div className="absolute inset-0 grid place-items-center text-white text-sm opacity-80 bg-black/50">
              <div className="flex flex-col items-center gap-2">
                <Camera className="size-8" />
                <span>Starting camera…</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-md">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Or paste the scanned URL
          </label>
          <input
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://phrsbx.abdm.gov.in/share-profile?hip-id=HF_ID&counter-id=COUNTER_ID"
            value={scanText}
            onChange={(e) => setScanText(e.target.value)}
          />
        </div>

        {parsed ? (
          <div className="text-sm text-green-700 flex max-sm:flex-col sm:items-center gap-2 bg-green-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0" /> Parsed HIP:{" "}
              <b>{parsed.hipId}</b>
            </div>
            <div className="flex items-center gap-2">
              <MonitorCheck className="size-4 shrink-0" />
              Counter: <b>{parsed.counterId}</b>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-2">
            Waiting for a valid QR/URL…
          </div>
        )}
      </Card>

      <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Token Received</DialogTitle>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="space-y-3">
                  {/* Token Number - Main Focus */}
                  <div className="flex items-center gap-2">
                    <Ticket className="size-6 text-green-600" />
                    <span className="text-3xl font-bold text-gray-900">
                      {selectedToken.tokenNumber}
                    </span>
                  </div>

                  {/* HIP Name and ID */}
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{selectedToken.hipName}</span>
                    <span className="text-gray-500 ml-1">
                      ({selectedToken.hipId})
                    </span>
                  </div>

                  {/* Counter ID */}
                  <div className="text-sm text-gray-600">
                    Counter:{" "}
                    <span className="font-medium">
                      {selectedToken.counterCode}
                    </span>
                  </div>

                  {/* Time Remaining */}
                  {selectedToken.isActive && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="size-4 shrink-0" />
                      <span className="font-medium">
                        Valid for{" "}
                        {(() => {
                          const hours = Math.floor(
                            selectedToken.remainingSeconds / 3600,
                          );
                          const minutes = Math.floor(
                            (selectedToken.remainingSeconds % 3600) / 60,
                          );
                          const seconds = selectedToken.remainingSeconds % 60;

                          if (hours > 0) {
                            return `${hours}h ${minutes}m`;
                          } else if (minutes > 0) {
                            return `${minutes}m ${seconds}s`;
                          } else {
                            return `${seconds}s`;
                          }
                        })()}
                      </span>
                    </div>
                  )}

                  {!selectedToken.isActive && (
                    <div className="text-sm text-gray-500">
                      This token has expired
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                {selectedToken.isActive
                  ? "Please share this token number at the counter."
                  : "This token is no longer valid. Please scan again."}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowTokenModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Details?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="text-gray-500">
              Share your details with <b>{parsed?.hipId}</b>
            </div>
            <div className="grid grid-cols-3 gap-y-2">
              <div className="text-gray-500">ABHA Number</div>
              <div className="col-span-2 font-medium">
                {user?.abhaNumber ?? "-"}
              </div>
              <div className="text-gray-500">ABHA Address</div>
              <div className="col-span-2 font-medium">{user?.abhaAddress}</div>
              <div className="text-gray-500">Name</div>
              <div className="col-span-2 font-medium">{user?.fullName}</div>
              <div className="text-gray-500">Gender</div>
              <div className="col-span-2 font-medium">{user?.gender}</div>
              <div className="text-gray-500">Date Of Birth</div>
              <div className="col-span-2 font-medium">
                {user?.dateOfBirth ??
                  `${user?.dayOfBirth ?? "--"}-${user?.monthOfBirth ?? "--"}-${user?.yearOfBirth ?? "----"}`}
              </div>
              <div className="text-gray-500">Mobile</div>
              <div className="col-span-2 font-medium">{user?.mobile}</div>
              <div className="text-gray-500">Address</div>
              <div className="col-span-2 font-medium break-words">
                {user?.address}
              </div>
            </div>
            <div className="text-xs text-gray-600 pt-2">
              You consent to the above information being shared with the
              facility. They can use this for registration and linking your
              health records.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConsentModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAgree}
              disabled={isSharing || pollingEnabled || !parsed}
            >
              {isSharing || pollingEnabled ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Waiting for token...
                </>
              ) : (
                "I Agree"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
