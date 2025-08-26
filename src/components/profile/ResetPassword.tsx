import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Edit2Icon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";

import { PASSWORD_REGEX } from "@/lib/validators";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { SetPasswordSection } from "@/components/profile/ProfileFormSections";

import routes from "@/api";
import { PasswordUpdateResponse, PhrProfile } from "@/types/profile";
import { mutate } from "@/utils/request/request";

export default function ResetPassword({ abhaAddress }: PhrProfile) {
  const [isEditing, setIsEditing] = useState(false);

  const schema = z
    .object({
      password: z
        .string()
        .trim()
        .refine((val) => !val || PASSWORD_REGEX.test(val), {
          error: "",
        }),
      confirmPassword: z.string().trim(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: mutate(routes.profile.updatePassword),
    onSuccess: (data: PasswordUpdateResponse) => {
      toast.success(data.detail);
      form.reset();
      setIsEditing(false);
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updatePasswordMutation.mutate({
      abha_address: abhaAddress,
      password: values.password,
    });
  };

  const isSubmitting = updatePasswordMutation.isPending;

  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:rounded-lg sm:px-6">
      {!isEditing && (
        <div className="mb-4 flex justify-start">
          <Button
            onClick={() => setIsEditing(true)}
            type="button"
            id="change-edit-password-button"
            variant="primary"
          >
            <Edit2Icon className="mr-2 size-4" />
            Update Password
          </Button>
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SetPasswordSection
              form={form}
              className="grid grid-cols-1 gap-4 items-start sm:grid-cols-2"
            />

            <div className="flex justify-end gap-4 mt-4">
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  form.reset();
                  setIsEditing(false);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
                variant="primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
