import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Avatar } from "@/components/common/Avatar";
import AvatarEditModal from "@/components/profile/dialogs/AvatarEditDialog";

import routes from "@/api";
import { PhrProfile } from "@/types/profile";
import { getProfilePhotoUrl } from "@/utils";
import { mutate } from "@/utils/request/request";

export default function UserAvatar(user: PhrProfile) {
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: mutate(routes.profile.updateProfile),
    onSuccess: () => {
      toast.success("Profile photo updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["abhaCard"] });
      setShowEditModal(false);
    },
  });

  const handlePhotoUpdate = (profilePhoto: string) => {
    const [year = "", month = "", day = ""] = user.dateOfBirth
      .split("-")
      .reverse();

    updateProfileMutation.mutate({
      first_name: user.firstName,
      middle_name: user.middleName || "",
      last_name: user.lastName || "",
      gender: user.gender,
      year_of_birth: year,
      month_of_birth: month,
      day_of_birth: day,
      state_code: user.stateCode,
      state_name: user.stateName,
      district_code: user.districtCode,
      district_name: user.districtName,
      address: user.address,
      pincode: user.pinCode,
      profile_photo: profilePhoto,
    });
  };

  return (
    <>
      <AvatarEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        currentImageUrl={getProfilePhotoUrl(user.profilePhoto)}
        onPhotoUpdate={handlePhotoUpdate}
        isLoading={updateProfileMutation.isPending}
        aspectRatio={1}
      />

      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:rounded-lg sm:px-6">
        <div className="flex items-center">
          <Avatar
            name={user.fullName}
            imageUrl={getProfilePhotoUrl(user.profilePhoto)}
            className="size-20"
          />
          <div className="my-4 ml-4 flex flex-col gap-2 items-start">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              type="button"
            >
              Change Avatar
            </Button>
            <p className="text-xs leading-5 text-gray-500">
              JPG, GIF or PNG. 100KB max.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
