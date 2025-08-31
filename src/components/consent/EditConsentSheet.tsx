import { Loader2, Save } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  ConsentDurationSection,
  HITypeSelector,
  HipSelector,
  SubscriptionCategoriesSelector,
} from "@/components/consent/ConsentFormSections";

import {
  ConsentBase,
  ConsentHITypes,
  ConsentLinks,
  isSubscription,
} from "@/types/consent";
import { SubscriptionCategories } from "@/types/subscription";
import { toIsoString } from "@/utils";

interface EditConsentSheetProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: ConsentBase;
  onUpdate: (payload: ConsentBase) => void;
  isLoading?: boolean;
}

interface FormData {
  fromDate: string;
  toDate: string;
  dataEraseAt: string;
  selectedHiTypes: ConsentHITypes[];
  selectedSubscriptionCategories: SubscriptionCategories[];
  selectedHips: ConsentLinks[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const validateFormData = (
  formData: FormData,
  isSubscriptionType: boolean,
): ValidationResult => {
  const errors: string[] = [];

  const fromDate = new Date(formData.fromDate);
  const toDate = new Date(formData.toDate);

  if (!formData.fromDate) {
    errors.push("From date is required");
  }

  if (!formData.toDate) {
    errors.push("To date is required");
  }

  if (fromDate >= toDate) {
    errors.push("From date must be before to date");
  }

  if (formData.dataEraseAt) {
    const dataEraseDate = new Date(formData.dataEraseAt);
    if (dataEraseDate <= toDate) {
      errors.push("Data erase date should be after the to date");
    }
  }

  if (formData.selectedHiTypes.length === 0) {
    errors.push("Please select at least one health information type");
  }

  if (formData.selectedHips.length === 0) {
    errors.push("Please select at least one health information provider");
  }

  if (
    isSubscriptionType &&
    formData.selectedSubscriptionCategories.length === 0
  ) {
    errors.push("Please select at least one subscription category");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default function EditConsentSheet({
  open,
  setOpen,
  data,
  onUpdate,
  isLoading = false,
}: EditConsentSheetProps) {
  const [formData, setFormData] = useState<FormData>({
    fromDate: "",
    toDate: "",
    dataEraseAt: "",
    selectedHiTypes: [],
    selectedSubscriptionCategories: [],
    selectedHips: [],
  });

  const isSubscriptionType = isSubscription(data.type);

  useEffect(() => {
    if (open && data) {
      setFormData({
        fromDate: data.fromDate,
        toDate: data.toDate,
        dataEraseAt: data.dataEraseAt || "",
        selectedHiTypes: data.hiTypes,
        selectedSubscriptionCategories: data.subscriptionCategories || [],
        selectedHips: data.links,
      });
    }
  }, [open, data]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate();
  };

  const handleUpdate = () => {
    const validation = validateFormData(formData, isSubscriptionType);

    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    const updatedData: ConsentBase = {
      ...data,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      dataEraseAt: formData.dataEraseAt,
      hiTypes: formData.selectedHiTypes,
      subscriptionCategories: formData.selectedSubscriptionCategories,
      links: formData.selectedHips,
    };

    onUpdate(updatedData);
  };

  const handleDateChange = (
    date: string,
    key: "fromDate" | "toDate" | "dataEraseAt",
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: toIsoString(date),
    }));
  };

  const handleHiTypesChange = (types: ConsentHITypes[]) => {
    setFormData((prev) => ({ ...prev, selectedHiTypes: types }));
  };

  const handleSubscriptionCategoriesChange = (
    categories: SubscriptionCategories[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      selectedSubscriptionCategories: categories,
    }));
  };

  const handleHipsChange = (hips: ConsentLinks[]) => {
    setFormData((prev) => ({ ...prev, selectedHips: hips }));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full sm:max-w-2xl overflow-y-auto p-6"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-lg">
            Edit {isSubscriptionType ? "Subscription" : "Consent"} Details
          </SheetTitle>
          <SheetDescription>
            Update the {isSubscriptionType ? "subscription" : "consent"}{" "}
            information and permissions below.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6 mt-4">
          <ConsentDurationSection
            fromDate={formData.fromDate}
            toDate={formData.toDate}
            dataEraseAt={formData.dataEraseAt}
            onDateChange={handleDateChange}
          />

          <HITypeSelector
            selectedTypes={formData.selectedHiTypes}
            onSelectionChange={handleHiTypesChange}
          />

          {isSubscriptionType && (
            <>
              <SubscriptionCategoriesSelector
                selectedCategories={formData.selectedSubscriptionCategories}
                onSelectionChange={handleSubscriptionCategoriesChange}
              />
            </>
          )}

          <HipSelector
            hips={data.availableLinks || data.links}
            selectedHips={formData.selectedHips}
            onSelectionChange={handleHipsChange}
            showContexts={!isSubscriptionType}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
