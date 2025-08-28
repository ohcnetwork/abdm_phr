import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";

import { ADDRESS_REGEX, PIN_CODE_REGEX, validators } from "@/lib/validators";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import {
  BasicDetailsSection,
  LocationDetailsSection,
} from "@/components/profile/ProfileFormSections";

import { GENDERS } from "@/common/constants";

import routes from "@/api";
import { PhrProfile } from "@/types/profile";
import { dateQueryString } from "@/utils";
import { mutate } from "@/utils/request/request";

type EditProfileFormProps = {
  userData: PhrProfile;
  onUpdateSuccess: () => void;
  isKYCVerified: boolean;
};

const schema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  middle_name: z.string().trim().optional(),
  last_name: z.string().trim().optional(),
  gender: z.enum(GENDERS, {
    error: "Gender is required",
  }),
  date_of_birth: validators.dateOfBirth,
  state_code: z.number({ error: "State is required" }),
  state_name: z.string(),
  district_code: z.number({ error: "District is required" }),
  district_name: z.string(),
  address: z
    .string()
    .trim()
    .min(1, { error: "Address is required" })
    .regex(ADDRESS_REGEX, {
      error:
        "Address can only contain letters, numbers, and these characters: ,.'/()-",
    }),
  pincode: z.string().regex(PIN_CODE_REGEX, {
    error: "Enter a valid 6 digit pincode",
  }),
});

type FormData = z.infer<typeof schema>;

export default function EditProfileForm({
  userData,
  onUpdateSuccess,
  isKYCVerified,
}: EditProfileFormProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: userData.firstName,
      middle_name: userData.middleName || "",
      last_name: userData.lastName || "",
      gender: userData.gender,
      date_of_birth:
        dateQueryString(userData.dateOfBirth) ||
        `${userData.yearOfBirth}-${userData.monthOfBirth || "01"}-${
          userData.dayOfBirth || "01"
        }`,
      state_code: Number(userData.stateCode),
      district_code: Number(userData.districtCode),
      state_name: userData.stateName,
      district_name: userData.districtName,
      address: userData.address,
      pincode: userData.pinCode,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: mutate(routes.profile.updateProfile),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["abhaCard"] });
      onUpdateSuccess();
    },
  });

  console.log(form.getValues());

  const onSubmit = (values: FormData) => {
    const [year = "", month = "", day = ""] = dateQueryString(
      values.date_of_birth,
    ).split("-");

    updateProfileMutation.mutate({
      ...values,
      year_of_birth: year || userData.yearOfBirth,
      month_of_birth: month || userData.monthOfBirth || "",
      day_of_birth: day || userData.dayOfBirth || "",
      state_code: values.state_code.toString(),
      district_code: values.district_code.toString(),
      profile_photo: userData.profilePhoto,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          {isKYCVerified && (
            <div className="flex items-start gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                These fields are as per your KYC document and cannot be edited.
              </span>
            </div>
          )}
          <h3 className="text-lg font-medium">Basic Details</h3>
          <BasicDetailsSection
            form={form}
            disableFields={isKYCVerified}
            className="grid grid-cols-1 gap-4 items-start sm:grid-cols-3"
          />
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium">Location Details</h3>
          <LocationDetailsSection
            form={form}
            className="grid grid-cols-1 gap-4 items-start sm:grid-cols-2"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          variant="primary"
          disabled={!form.formState.isDirty || updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <>
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>
    </Form>
  );
}
