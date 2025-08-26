import { Ellipsis, Mail, Phone } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import UpdateEmailDialog from "@/components/profile/dialogs/UpdateEmailDialog";
import UpdateMobileDialog from "@/components/profile/dialogs/UpdateMobileDialog";

import { PhrProfile } from "@/types/profile";

const LabelValue = ({
  label,
  value,
  id,
  className = "",
}: {
  label: string;
  value?: string | null;
  id?: string;
  className?: string;
}) => (
  <div className="flex flex-col gap-1">
    <p className="text-sm text-gray-500">{label}</p>
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          id={`view-${id}`}
          className={cn("text-sm truncate max-w-fit", className)}
        >
          {value || "-"}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-white">
        {value || "-"}
      </TooltipContent>
    </Tooltip>
  </div>
);

interface BadgeProps {
  text: string;
  textColor?: string;
  className?: string;
}

export const Badge = ({
  text,
  textColor = "text-black",
  className = "",
}: BadgeProps) => {
  return (
    <div className="mb-4">
      <div className="my-1 h-1 w-6 bg-blue-600" />
      <span
        className={cn(
          "inline-flex items-center rounded-full text-base font-semibold",
          textColor,
          className,
        )}
      >
        {text}
      </span>
    </div>
  );
};

const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-sm border px-6 py-8">
    {children}
  </div>
);

export const BasicInfo = (user: PhrProfile) => {
  return (
    <SectionWrapper>
      <Badge text="Basic Information" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LabelValue
          id="abha_number"
          label="ABHA Number"
          value={user.abhaNumber}
        />
        <LabelValue
          id="abha_address"
          label="ABHA Address"
          value={user.abhaAddress}
        />
        <LabelValue id="first_name" label="First Name" value={user.firstName} />
        <LabelValue
          id="middle_name"
          label="Middle Name"
          value={user.middleName}
        />
        <LabelValue id="last_name" label="Last Name" value={user.lastName} />
        <LabelValue
          id="date_of_birth"
          label="Date of Birth"
          value={user.dateOfBirth}
        />
        <LabelValue id="gender" label="Gender" value={user.gender} />
      </div>
    </SectionWrapper>
  );
};

export const ContactInfo = (user: PhrProfile) => {
  const [showMobileDialog, setShowMobileDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  return (
    <SectionWrapper>
      <div className="flex justify-between">
        <Badge text="Contact Information" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Button
                size="sm"
                onClick={() => setShowEmailDialog(true)}
                variant="ghost"
                className="w-full flex flex-row justify-stretch items-center"
              >
                <Mail className="mr-1" />
                <span>Update Email</span>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button
                size="sm"
                onClick={() => setShowMobileDialog(true)}
                variant="ghost"
                className="w-full flex flex-row justify-stretch items-center"
              >
                <Phone className="mr-1" />
                <span>Update Mobile</span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LabelValue id="email" label="Email" value={user.email} />
        <LabelValue id="phone_number" label="Mobile" value={user.mobile} />
      </div>

      <UpdateMobileDialog
        open={showMobileDialog}
        setOpen={setShowMobileDialog}
      />

      <UpdateEmailDialog open={showEmailDialog} setOpen={setShowEmailDialog} />
    </SectionWrapper>
  );
};

export const LocationInfo = (user: PhrProfile) => {
  return (
    <SectionWrapper>
      <Badge text="Location Information" />
      <div className="space-y-4">
        <LabelValue
          id="address"
          label="Address"
          value={user.address}
          className="break-words whitespace-normal"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <LabelValue
            id="district"
            label="District"
            value={user.districtName}
          />
          <LabelValue id="state" label="State" value={user.stateName} />
          <LabelValue id="pincode" label="Pincode" value={user.pinCode} />
        </div>
      </div>
    </SectionWrapper>
  );
};
