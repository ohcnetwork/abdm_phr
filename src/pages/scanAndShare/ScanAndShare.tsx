import { QrCode, Ticket } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Scan from "./Scan";
import Tokens from "./Tokens";

export default function ScanAndShare() {
  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        <div className="w-full max-w-2xl space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Scan and Share
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Scan the QR displayed at facility counter
            </p>
          </div>

          <Tabs defaultValue="scan" className="w-full">
            <TabsList defaultValue="tokens" className="w-full justify-start">
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <QrCode className="size-4" />
                Scan
              </TabsTrigger>
              <TabsTrigger value="tokens" className="flex items-center gap-2">
                <Ticket className="size-4" />
                Tokens
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="mt-4">
              <Scan />
            </TabsContent>

            <TabsContent value="tokens" className="mt-4">
              <Tokens />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
