import { useQuery } from "@tanstack/react-query";
import { Clock, Ticket } from "lucide-react";
import { useMemo } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import routes from "@/api";
import type { ScanAndShareToken } from "@/types/gateway";
import dayjs from "@/utils/dayjs";
import { query } from "@/utils/request/request";

export default function Tokens() {
  const { data: allTokens } = useQuery({
    queryKey: ["allShareTokens"],
    queryFn: query(routes.gateway.listSharedProfileTokens, { silent: true }),
  });

  const processedTokens = useMemo(() => {
    if (!allTokens) return [];
    const now = dayjs();

    const processed = allTokens.map((token: ScanAndShareToken) => {
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

    return processed
      .sort((a, b) => dayjs(b.dateCreated).diff(dayjs(a.dateCreated)))
      .slice(0, 10);
  }, [allTokens]);

  const formatTimeRemaining = (remainingSeconds: number, isActive: boolean) => {
    if (!isActive) {
      return "Expired";
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return processedTokens && processedTokens.length > 0 ? (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>
          <h3 className="text-lg font-semibold text-gray-800">Tokens</h3>
          <p className="text-xs font-normal text-gray-600 mb-4">
            Showing the last 10 tokens
          </p>
        </CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {processedTokens.map((token) => (
          <div
            key={token.id}
            className={`p-4 border rounded-lg transition-colors ${
              token.isActive
                ? "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                : "border-gray-200 bg-gray-50 opacity-60"
            }`}
          >
            <div className="space-y-2">
              {/* Token Number - Main Focus */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-bold ${
                    token.isActive ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {token.tokenNumber}
                </span>
              </div>

              {/* HIP Name and ID */}
              <div
                className={`text-sm ${
                  token.isActive ? "text-gray-700" : "text-gray-500"
                }`}
              >
                <span className="font-medium">{token.hipName}</span>
                <span className="ml-1">({token.hipId})</span>
              </div>

              {/* Counter ID */}
              <div
                className={`text-sm ${
                  token.isActive ? "text-gray-600" : "text-gray-500"
                }`}
              >
                Counter:{" "}
                <span className="font-medium">{token.counterCode}</span>
              </div>

              {/* Time Remaining / Expired */}
              <div
                className={`flex items-center gap-2 text-sm ${
                  token.isActive ? "text-amber-600" : "text-gray-500"
                }`}
              >
                <Clock className="size-4 shrink-0" />
                <span className="font-medium">
                  {formatTimeRemaining(token.remainingSeconds, token.isActive)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  ) : (
    <Card className="p-6">
      <div className="text-center py-8 text-gray-500">
        <Ticket className="size-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm">No tokens</p>
        <p className="text-xs mt-1 text-gray-400">
          Scan a QR code to generate a token
        </p>
      </div>
    </Card>
  );
}
