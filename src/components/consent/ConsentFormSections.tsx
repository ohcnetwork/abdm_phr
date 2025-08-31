import dayjs from "dayjs";
import { Check, ChevronDown, Minus } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import { usePatientLinks } from "@/hooks/usePatientLinks";

import { ConsentHITypes, ConsentLinks } from "@/types/consent";
import { SubscriptionCategories } from "@/types/subscription";
import { dateQueryString, toTitleCase } from "@/utils";

export function ConsentDurationSection({
  fromDate,
  toDate,
  dataEraseAt,
  onDateChange,
}: {
  fromDate: string;
  toDate: string;
  dataEraseAt: string;
  onDateChange: (
    date: string,
    key: "fromDate" | "toDate" | "dataEraseAt",
  ) => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-medium">Consent Duration</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Valid From</Label>
          <Input
            type="date"
            max={dayjs().format("YYYY-MM-DD")}
            value={dateQueryString(fromDate)}
            onChange={(e) => onDateChange(e.target.value, "fromDate")}
          />
        </div>
        <div className="space-y-2">
          <Label>Valid To</Label>
          <Input
            type="date"
            max={dayjs().format("YYYY-MM-DD")}
            value={dateQueryString(toDate)}
            onChange={(e) => onDateChange(e.target.value, "toDate")}
          />
        </div>
      </div>

      {dataEraseAt && (
        <div className="space-y-2">
          <Label>Data Erase At</Label>
          <Input
            type="datetime-local"
            step={1}
            min={dayjs().format("YYYY-MM-DDTHH:mm:ss")}
            value={dateQueryString(dataEraseAt, true)}
            onChange={(e) => {
              console.log(e.target.value);
              console.log(dateQueryString(e.target.value, true));
              onDateChange(e.target.value, "dataEraseAt");
            }}
          />
        </div>
      )}
    </div>
  );
}

export function HITypeSelector({
  selectedTypes,
  onSelectionChange,
}: {
  selectedTypes: ConsentHITypes[];
  onSelectionChange: (types: ConsentHITypes[]) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-5">
      <h3 className="text-lg font-medium">Health Information Types</h3>

      <div className="grid gap-3">
        {Object.values(ConsentHITypes).map((type) => {
          const isChecked = selectedTypes.includes(type);

          return (
            <Label
              key={type}
              className={cn(
                "flex items-center gap-3 rounded-md border p-3 transition-all cursor-pointer",
                isChecked
                  ? "border-primary/40 bg-primary/5"
                  : "border-gray-200 hover:bg-gray-50",
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() =>
                  onSelectionChange(
                    isChecked
                      ? selectedTypes.filter((t) => t !== type)
                      : [...selectedTypes, type],
                  )
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary text-white"
              />
              <span className="text-sm font-medium text-gray-900">{type}</span>
            </Label>
          );
        })}
      </div>
    </div>
  );
}

export function SubscriptionCategoriesSelector({
  selectedCategories,
  onSelectionChange,
}: {
  selectedCategories: SubscriptionCategories[];
  onSelectionChange: (categories: SubscriptionCategories[]) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-5">
      <h3 className="text-lg font-medium">Subscription Categories</h3>

      <div className="grid gap-3">
        {Object.values(SubscriptionCategories).map((item) => {
          const isChecked = selectedCategories.includes(item);

          return (
            <Label
              key={item}
              className={cn(
                "flex items-start gap-3 rounded-md border p-3 transition-all cursor-pointer",
                isChecked
                  ? "border-primary/40 bg-primary/5"
                  : "border-gray-200 hover:bg-gray-50",
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() =>
                  onSelectionChange(
                    isChecked
                      ? selectedCategories.filter((c) => c !== item)
                      : [...selectedCategories, item],
                  )
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary text-white mt-1"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900">
                  {toTitleCase(item)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item === SubscriptionCategories.LINK
                    ? "Enables HIU to receive new care context links"
                    : "Enables HIU to access data on existing care contexts"}
                </span>
              </div>
            </Label>
          );
        })}
      </div>
    </div>
  );
}

export function HipSelector({
  hips,
  selectedHips,
  onSelectionChange,
  showContexts,
}: {
  hips: ConsentLinks[];
  selectedHips: ConsentLinks[];
  onSelectionChange: (hips: ConsentLinks[]) => void;
  showContexts: boolean;
}) {
  const { getHipName } = usePatientLinks();
  const selectedHipsMap = useMemo(
    () => new Map(selectedHips.map((hip) => [hip.hip.id, hip])),
    [selectedHips],
  );

  const getHipState = (hip: ConsentLinks) => {
    const selectedHip = selectedHipsMap.get(hip.hip.id);

    if (!showContexts || !hip.careContexts?.length) {
      return selectedHip ? "checked" : "unchecked";
    }

    if (!selectedHip?.careContexts?.length) return "unchecked";

    const selectedCount = selectedHip.careContexts.length;
    const totalCount = hip.careContexts.length;

    if (selectedCount === 0) return "unchecked";
    if (selectedCount === totalCount) return "checked";
    return "indeterminate";
  };

  const isContextSelected = (hipId: string, contextRef: string) => {
    const selectedHip = selectedHipsMap.get(hipId);
    return (
      selectedHip?.careContexts?.some(
        (ctx) => ctx.careContextReference === contextRef,
      ) ?? false
    );
  };

  const toggleHip = (hip: ConsentLinks) => {
    const hipId = hip.hip.id;
    const isSelected = selectedHipsMap.has(hipId);

    if (isSelected) {
      onSelectionChange(selectedHips.filter((h) => h.hip.id !== hipId));
    } else {
      const newHip: ConsentLinks = {
        hip: hip.hip,
        careContexts: showContexts ? hip.careContexts : undefined,
      };
      onSelectionChange([...selectedHips, newHip]);
    }
  };

  const toggleContext = (hip: ConsentLinks, contextRef: string) => {
    if (!showContexts || !hip.careContexts) return;

    const hipId = hip.hip.id;
    const targetContext = hip.careContexts.find(
      (ctx) => ctx.careContextReference === contextRef,
    );
    if (!targetContext) return;

    const selectedHip = selectedHipsMap.get(hipId);
    const currentContexts = selectedHip?.careContexts || [];
    const isSelected = currentContexts.some(
      (ctx) => ctx.careContextReference === contextRef,
    );

    const newContexts = isSelected
      ? currentContexts.filter((ctx) => ctx.careContextReference !== contextRef)
      : [...currentContexts, targetContext];

    const updatedHip: ConsentLinks = {
      hip: hip.hip,
      careContexts: newContexts.length > 0 ? newContexts : undefined,
    };

    const newSelectedHips =
      newContexts.length > 0
        ? selectedHips.map((h) => (h.hip.id === hipId ? updatedHip : h))
        : selectedHips.filter((h) => h.hip.id !== hipId);

    if (newContexts.length > 0 && !selectedHipsMap.has(hipId)) {
      newSelectedHips.push(updatedHip);
    }

    onSelectionChange(newSelectedHips);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-5">
      <h3 className="text-lg font-medium">Health Information Providers</h3>

      {hips.map((hip) => {
        const hipId = hip.hip.id;
        const hipState = getHipState(hip);
        const selectedHip = selectedHipsMap.get(hipId);
        const selectedContextCount = selectedHip?.careContexts?.length || 0;

        return (
          <Collapsible
            key={hipId}
            disabled={!showContexts || !hip.careContexts?.length}
          >
            <div
              className={cn(
                "bg-white border rounded-md transition-all",
                hipState === "checked" &&
                  "border-primary/50 shadow-sm shadow-primary/10",
                hipState === "indeterminate" &&
                  "border-primary/20 shadow-primary/5",
                hipState === "unchecked" && "border-gray-200 hover:shadow-md",
              )}
            >
              <CollapsibleTrigger asChild>
                <div
                  className={cn(
                    "flex items-center justify-between w-full p-4",
                    showContexts && "cursor-pointer",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "size-5 rounded border-2 transition-all flex items-center justify-center cursor-pointer",
                        hipState === "checked" || hipState === "indeterminate"
                          ? "bg-primary border-primary text-white"
                          : "border-gray-300 hover:border-gray-400",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHip(hip);
                      }}
                    >
                      {hipState === "checked" && <Check className="size-4" />}
                      {hipState === "indeterminate" && (
                        <Minus className="size-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">
                        {hip.hip.name || getHipName(hip.hip.id) || "N/A"}
                      </span>
                      {showContexts &&
                        hip.careContexts &&
                        selectedContextCount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {selectedContextCount} of {hip.careContexts.length}{" "}
                            contexts selected
                          </p>
                        )}
                    </div>
                  </div>

                  {showContexts && hip.careContexts?.length && (
                    <ChevronDown className="size-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                  )}
                </div>
              </CollapsibleTrigger>

              {showContexts && hip.careContexts && (
                <CollapsibleContent className="px-4 pb-4 border-t border-gray-200">
                  <ScrollArea>
                    <div className="pt-4 space-y-2 max-h-[350px]">
                      {hip.careContexts.map((ctx) => {
                        const isSelected = isContextSelected(
                          hipId,
                          ctx.careContextReference,
                        );
                        return (
                          <div
                            key={ctx.careContextReference}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                              isSelected
                                ? "border-primary/40 bg-primary/5"
                                : "border-gray-200 hover:border-gray-200 hover:bg-gray-50",
                            )}
                            onClick={() =>
                              toggleContext(hip, ctx.careContextReference)
                            }
                          >
                            <div
                              className={cn(
                                "size-5 rounded border-2 transition-all flex items-center justify-center",
                                isSelected
                                  ? "bg-primary border-primary text-white"
                                  : "border-gray-300",
                              )}
                            >
                              {isSelected && <Check className="size-3" />}
                            </div>
                            <span
                              className={cn(
                                "text-sm",
                                isSelected
                                  ? "text-primary font-medium"
                                  : "text-gray-700",
                              )}
                            >
                              {ctx.display || ctx.careContextReference}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              )}
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
