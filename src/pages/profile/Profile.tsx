import {
  CircleCheckIcon,
  Link2Icon,
  SquarePen,
  Star,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Avatar } from "@/components/common/Avatar";
import Page from "@/components/common/Page";
import AutoApprovalSetup from "@/components/profile/AutoApprovalSetup";
import EditProfileSheet from "@/components/profile/EditProfileSheet";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileColumns from "@/components/profile/ProfileColumns";
import {
  BasicInfo,
  ContactInfo,
  LocationInfo,
} from "@/components/profile/ProfileViewDetails";
import ResetPassword from "@/components/profile/ResetPassword";
import UserAvatar from "@/components/profile/UserAvatar";
import AbhaUnlinkDialog from "@/components/profile/dialogs/AbhaUnlinkDialog";
import DownloadAbhaDialog from "@/components/profile/dialogs/DownloadAbhaDialog";
import SelectPreferredAbhaDialog from "@/components/profile/dialogs/SelectPreferredAbhaDialog";
import SwitchProfileDialog from "@/components/profile/dialogs/SwitchProfileDialog";

import { useAuthContext } from "@/hooks/useAuth";

import { KycStatuses, PhrProfile } from "@/types/profile";
import { getProfilePhotoUrl } from "@/utils";

function PreferredBadge({ isPreferred }: { isPreferred: boolean }) {
  if (!isPreferred) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="flex items-center mt-0.5 bg-blue-50 text-blue-600 border-blue-200"
        >
          <Star className="size-3" aria-hidden="true" />
          Preferred
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-white">
        Preferred ABHA Address
      </TooltipContent>
    </Tooltip>
  );
}

function KYCStatusBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center mt-0.5",
        isVerified
          ? "bg-green-50 text-primary-500 border-primary-200"
          : "bg-yellow-50 text-warning-500 border-yellow-200",
      )}
    >
      {isVerified ? (
        <CircleCheckIcon className="size-3" aria-hidden="true" />
      ) : (
        <TriangleAlert className="size-3" aria-hidden="true" />
      )}
      <span>{isVerified ? "KYC Verified" : "Self Declared"}</span>
    </Badge>
  );
}

function AbhaNumberDisplay({
  isKYCVerified,
  abhaNumber,
}: {
  isKYCVerified: boolean;
  abhaNumber?: string;
}) {
  return (
    <>
      {isKYCVerified && abhaNumber ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm font-light text-gray-600 truncate">
              {abhaNumber}
            </p>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-white">
            {abhaNumber}
          </TooltipContent>
        </Tooltip>
      ) : (
        <p className="text-sm text-gray-500">No ABHA Number Linked</p>
      )}
    </>
  );
}

function ProfileHeader({
  userData,
  isKYCVerified,
}: {
  userData: PhrProfile;
  isKYCVerified: boolean;
}) {
  return (
    <div className="flex gap-4 items-start">
      <Avatar
        imageUrl={getProfilePhotoUrl(userData.profilePhoto)}
        name={userData.fullName}
        className="size-27 shrink-0 sm:size-24"
      />

      <div className="flex-1 min-w-0">
        <div className="space-y-2">
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 className="text-lg sm:text-xl font-bold truncate">
                  {userData.abhaAddress}
                </h1>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-white">
                {userData.abhaAddress}
              </TooltipContent>
            </Tooltip>

            <div className="mt-1">
              <AbhaNumberDisplay
                isKYCVerified={isKYCVerified}
                abhaNumber={userData.abhaNumber}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <KYCStatusBadge isVerified={isKYCVerified} />
            <PreferredBadge
              isPreferred={
                userData.preferredAbhaAddress === userData.abhaAddress
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AbhaManagementSection({
  isKYCVerified,
  onAction,
}: {
  isKYCVerified: boolean;
  onAction: () => void;
}) {
  if (isKYCVerified) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            ABHA Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-md border p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Unlink ABHA Number</h3>
              <p className="text-sm text-gray-700">
                Disconnect your ABHA number from this account. This will remove
                verification benefits but won't delete your profile.
              </p>
            </div>
            <Button onClick={onAction} variant="destructive" className="w-fit">
              <Link2Icon className="h-4 mr-2" />
              Unlink ABHA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="text-warning">Complete ABHA Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-md border p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Link ABHA Number</h3>
              <p className="text-sm text-gray-700">
                Your account is incomplete. Link your ABHA number to verify your
                identity and access full health services.
              </p>
            </div>
            <Button
              onClick={onAction}
              className="w-fit bg-warning hover:bg-warning/90 text-white"
            >
              <Link2Icon className="h-4 mr-2" />
              Link ABHA Number
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default function Profile() {
  const { user, switchProfileEnabled } = useAuthContext();

  const [modals, setModals] = useState({
    editProfile: false,
    switchProfile: false,
    selectPreferredAbha: false,
    downloadAbha: false,
    abhaUnlink: false,
  });

  const toggleModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
  };

  const isKYCVerified = user?.kycStatus === KycStatuses.VERIFIED;

  if (!user) {
    return null;
  }

  return (
    <Page title="ABHA Profile" hideTitleOnPage>
      <div className="mx-auto space-y-8">
        <ProfileHeader userData={user} isKYCVerified={isKYCVerified} />

        <div className="flex gap-3 justify-end flex-wrap">
          <Button
            variant="outline"
            onClick={() => toggleModal("editProfile")}
            className="flex items-center gap-2"
          >
            <SquarePen className="size-4" />
            Edit Profile
          </Button>

          <ProfileActions
            onSwitchProfile={() => toggleModal("switchProfile")}
            onSelectPreferredAbha={() => toggleModal("selectPreferredAbha")}
            onDownloadAbha={() => toggleModal("downloadAbha")}
            canSelectPreferredAbha={
              user.preferredAbhaAddress !== user.abhaAddress && isKYCVerified
            }
            switchProfileEnabled={switchProfileEnabled}
          />
        </div>

        <div className="space-y-8">
          <ProfileColumns
            heading="Edit Avatar"
            note="View or update your profile picture."
            Child={UserAvatar}
            childProps={user}
          />

          <ProfileColumns
            heading="Basic Information"
            note="Your personal details and identification information."
            Child={BasicInfo}
            childProps={user}
          />

          <ProfileColumns
            heading="Contact Information"
            note="View or update your contact information."
            Child={ContactInfo}
            childProps={user}
          />

          <ProfileColumns
            heading="Location Information"
            note="View or update your address and location details."
            Child={LocationInfo}
            childProps={user}
          />

          <ProfileColumns
            heading="Auto Approval"
            note="Set up and manage auto approval of consent requests."
            Child={AutoApprovalSetup}
            childProps={user}
          />

          <ProfileColumns
            heading="Security"
            note="Set a new password or update the current one."
            Child={ResetPassword}
            childProps={user}
          />
        </div>

        <AbhaManagementSection
          isKYCVerified={isKYCVerified}
          onAction={() => toggleModal("abhaUnlink")}
        />
      </div>

      <EditProfileSheet
        open={modals.editProfile}
        setOpen={() => toggleModal("editProfile")}
        userData={user}
        isKYCVerified={isKYCVerified}
      />

      <SwitchProfileDialog
        open={modals.switchProfile}
        setOpen={() => toggleModal("switchProfile")}
        currentAbhaAddress={user.abhaAddress}
        preferredAbhaAddress={user.preferredAbhaAddress || ""}
      />

      <DownloadAbhaDialog
        open={modals.downloadAbha}
        setOpen={() => toggleModal("downloadAbha")}
      />

      <SelectPreferredAbhaDialog
        open={modals.selectPreferredAbha}
        setOpen={() => toggleModal("selectPreferredAbha")}
        existingAbhaNumber={user.abhaNumber || ""}
      />

      <AbhaUnlinkDialog
        open={modals.abhaUnlink}
        setOpen={() => toggleModal("abhaUnlink")}
        isKYCVerified={isKYCVerified}
        existingAbhaNumber={user.abhaNumber || ""}
        currentAbhaAddress={user.abhaAddress}
      />
    </Page>
  );
}
