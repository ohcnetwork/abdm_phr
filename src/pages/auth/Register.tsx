import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useNavigate } from "raviger";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AbhaNumberOtpFlow from "@/components/auth/AbhaNumberOtpFlow";
import HandleExistingAbhaAddress from "@/components/auth/HandleExistingAbha";
import MobileNumberOtpFlow from "@/components/auth/MobileNumberOtpFlow";
import ValidationHelper from "@/components/common/ValidationHelper";
import {
  BasicDetailsSection,
  LocationDetailsSection,
  SetPasswordSection,
} from "@/components/profile/ProfileFormSections";

import useMultiStepForm, { InjectedStepProps } from "@/hooks/useMultiStepForm";

import { DOMAIN } from "@/common/constants";

import routes from "@/api";
import {
  AuthMode,
  FormMemory,
  SendOtpBody,
  VerifyOtpResponse,
} from "@/types/auth";
import { mutate } from "@/utils/request/request";

const RegisterAbha = () => {
  const { currentStep } = useMultiStepForm<FormMemory>(
    [
      {
        id: "register",
        element: <Register {...({} as RegisterProps)} />,
      },
      {
        id: "handle-existing-abha",
        element: <HandleExistingAbha {...({} as HandleExistingAbhaProps)} />,
      },
      {
        id: "add-personal-details",
        element: <AddBasicDetails {...({} as AddBasicDetailsProps)} />,
      },
      {
        id: "add-address",
        element: <AddLocationDetails {...({} as AddLocationDetailsProps)} />,
      },
      {
        id: "choose-abha-address",
        element: <ChooseAbhaAddress {...({} as ChooseAbhaAddressProps)} />,
      },
      {
        id: "set-password",
        element: <SetPassword {...({} as SetPasswordProps)} />,
      },
    ],
    {
      transactionId: "mock-id",
      mode: "mobile-number",
      existingAbhaAddresses: [],
      phrProfile: {
        abha_address: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "O",
        day_of_birth: "",
        month_of_birth: "",
        year_of_birth: "",
        address: "",
        state_name: "",
        state_code: "",
        district_name: "",
        district_code: "",
        pincode: "",
        mobile: "",
        email: "",
        profile_photo: "",
        password: "",
      },
    },
  );

  return (
    <div className="flex min-h-screen flex-col-reverse md:flex-row">
      <div className="bg-primary-500 flex-1"></div>
      <div className="md:w-1/2 w-full flex justify-center items-center my-8">
        <div className="w-full max-w-[400px]">{currentStep}</div>
      </div>
    </div>
  );
};

export default RegisterAbha;

type RegisterProps = InjectedStepProps<FormMemory>;

const Register: FC<RegisterProps> = ({ memory, setMemory, goTo }) => {
  const navigate = useNavigate();

  const onVerifyOtpSuccess = (
    data: VerifyOtpResponse,
    sendOtpContext?: SendOtpBody,
  ) => {
    let mobileNumber = data.abha_number?.mobile || "";

    if (sendOtpContext?.type === "mobile-number" && sendOtpContext?.value) {
      mobileNumber = sendOtpContext.value;
    }

    const dob = data.abha_number?.date_of_birth ?? "";
    const [year, month, day] = dob.split("-");

    setMemory((prev) => ({
      ...prev,
      transactionId: data.transaction_id,
      existingAbhaAddresses: data.users,
      phrProfile: {
        ...prev.phrProfile!,
        ...data.abha_number,
        abha_address: data.abha_number?.health_id ?? "",
        day_of_birth: day ?? "",
        month_of_birth: month ?? "",
        year_of_birth: year ?? "",
        district_name: data.abha_number?.district ?? "",
        state_name: data.abha_number?.state ?? "",
        mobile: mobileNumber,
        last_name: data.abha_number?.last_name ?? "",
        middle_name: data.abha_number?.middle_name ?? "",
        email: data.abha_number?.email ?? "",
      },
    }));

    goTo("handle-existing-abha");
  };

  return (
    <Card className="mx-4">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-2xl font-bold">Register with ABHA</CardTitle>
        <CardDescription>Choose a method to register with ABHA</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="staff"
          value={memory?.mode ?? "mobile-number"}
          onValueChange={(value) => {
            setMemory((prev) => ({
              ...prev,
              mode: value as AuthMode,
            }));
          }}
        >
          <TabsList className="flex w-full">
            <TabsTrigger className="flex-1" value="mobile-number">
              Mobile
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="abha-number">
              ABHA Number
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile-number">
            <MobileNumberOtpFlow
              flowType="enrollment"
              transactionId={memory?.transactionId}
              setMemory={setMemory}
              onVerifyOtpSuccess={onVerifyOtpSuccess}
            />
          </TabsContent>

          <TabsContent value="abha-number">
            <AbhaNumberOtpFlow
              flowType="enrollment"
              transactionId={memory?.transactionId}
              setMemory={setMemory}
              onVerifyOtpSuccess={onVerifyOtpSuccess}
            />
          </TabsContent>
          <div className="mt-4 text-sm text-center text-gray-500">
            <span>Already have an account? </span>
            <Button
              variant="link"
              className="h-auto p-0 text-primary-600"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

type HandleExistingAbhaProps = InjectedStepProps<FormMemory>;

const HandleExistingAbha: FC<HandleExistingAbhaProps> = ({ memory, goTo }) => {
  return (
    <HandleExistingAbhaAddress
      flowType="enrollment"
      memory={memory}
      goTo={goTo}
    />
  );
};

type AddBasicDetailsProps = InjectedStepProps<FormMemory>;

const AddBasicDetails: FC<AddBasicDetailsProps> = ({
  memory,
  setMemory,
  goTo,
}) => {
  const schema = z.object({
    first_name: z.string().nonempty({
      message: "First name is required",
    }),
    middle_name: z.string().optional(),
    last_name: z.string().optional(),
    gender: z.enum(["M", "F", "O"], {
      required_error: "Gender is required",
    }),
    date_of_birth: z
      .string({
        required_error: "Date of birth is required",
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date of birth must be in YYYY-MM-DD format",
      }),
    email: z
      .string()
      .email({
        message: "Invalid email address",
      })
      .optional(),
    profile_photo: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: undefined,
      date_of_birth: "",
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!memory?.phrProfile) return;

    setMemory((prev) => ({
      ...prev,
      phrProfile: {
        ...prev.phrProfile!,
        ...data,
        middle_name: data.middle_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        profile_photo: data.profile_photo ?? "",
      },
    }));
    goTo("add-address");
  };

  return (
    <Card className="mx-4 sm:w-full">
      <CardHeader className="px-4 space-y-1">
        <CardTitle className="text-2xl font-bold">Personal Details</CardTitle>
        <CardDescription>Enter your basic details to proceed.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicDetailsSection form={form} showEmail />

            <Button
              type="submit"
              disabled={!form.formState.isDirty}
              className="w-full"
            >
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

type AddLocationDetailsProps = InjectedStepProps<FormMemory>;

const AddLocationDetails: FC<AddLocationDetailsProps> = ({
  setMemory,
  goTo,
}) => {
  const schema = z.object({
    state_code: z.number({ required_error: "State is required" }),
    state_name: z.string(),
    district_code: z.number({ required_error: "District is required" }),
    district_name: z.string(),
    address: z.string().min(1, { message: "Address is required" }),
    pincode: z
      .string()
      .regex(/^\d{6}$/, { message: "Pin code must be exactly 6 digits" }),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      state_code: undefined,
      district_code: undefined,
      address: "",
      pincode: "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    setMemory((prev) => ({
      ...prev,
      phrProfile: {
        ...prev.phrProfile!,
        ...data,
        state_code: data.state_code.toString(),
        district_code: data.district_code.toString(),
      },
    }));
    goTo("choose-abha-address");
  };

  return (
    <Card className="mx-4 sm:w-full">
      <CardHeader className="px-4 space-y-1">
        <CardTitle className="text-2xl font-bold">Location Details</CardTitle>
        <CardDescription>Enter your location and address info.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <LocationDetailsSection form={form} />
            <Button
              type="submit"
              disabled={!form.formState.isDirty}
              className="w-full"
            >
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

type ChooseAbhaAddressProps = InjectedStepProps<FormMemory>;

export const ChooseAbhaAddress: FC<ChooseAbhaAddressProps> = ({
  memory,
  setMemory,
  goTo,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const schema = z.object({
    abhaAddress: z.string().regex(/^(?![\d.])[a-zA-Z0-9._]{4,}(?<!\.)$/),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      abhaAddress: "",
    },
  });

  const abhaSuggestionsMutationFn = mutate(
    routes.register.abhaAddressSuggestions,
  );
  const fetchSuggestionsMutation = useMutation({
    mutationFn: abhaSuggestionsMutationFn,
    onSuccess: ({ transaction_id, abha_addresses }) => {
      setMemory((prev) => ({ ...prev, transactionId: transaction_id }));
      setSuggestions(abha_addresses.map((a) => a.replace(DOMAIN, "")));
    },
  });

  const checkAbhaAdressExistsMutationFn = mutate(
    routes.register.checkAbhaExists,
  );
  const checkAbhaAddressExistsMutation = useMutation({
    mutationFn: checkAbhaAdressExistsMutationFn,
    onSuccess: (data) => {
      if (data.exists) {
        toast.error("ABHA address already exists. Please choose another.");
      } else {
        setMemory((prev) => ({
          ...prev,
          phrProfile: {
            ...prev.phrProfile!,
            abha_address: `${form.getValues("abhaAddress")}${DOMAIN}`,
          },
        }));
        goTo("set-password");
      }
    },
  });

  useEffect(() => {
    if (
      !memory?.transactionId ||
      !memory?.phrProfile ||
      suggestions.length > 0
    ) {
      return;
    }

    fetchSuggestionsMutation.mutate({
      transaction_id: memory.transactionId,
      first_name: memory.phrProfile.first_name,
      year_of_birth: memory.phrProfile.year_of_birth,
      last_name: memory.phrProfile.last_name ?? "",
      month_of_birth: memory.phrProfile.month_of_birth ?? "",
      day_of_birth: memory.phrProfile.day_of_birth ?? "",
    });
  }, [memory?.transactionId, memory?.phrProfile, suggestions]);

  const onSubmit = (values: FormValues) => {
    const fullAddress = `${values.abhaAddress}${DOMAIN}`;
    checkAbhaAddressExistsMutation.mutate({
      abha_address: fullAddress,
    });
  };

  const abhaInput = form.watch("abhaAddress");

  const rules = [
    {
      condition: abhaInput.length >= 4,
      content: "Must be at least 4 characters",
    },
    {
      condition: /^[a-zA-Z_]/.test(abhaInput),
      content: "Must start with alphabet or underscore",
    },
    { condition: !abhaInput.endsWith("."), content: "Must not end with a dot" },
    {
      condition: /^[0-9a-zA-Z._]+$/.test(abhaInput),
      content: "Can only contain alphanumeric, dots, underscores",
    },
  ];

  return (
    <Card className="mx-4 sm:w-full">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-2xl font-bold">
          Create ABHA Address
        </CardTitle>
        <CardDescription className="text-sm">
          Choose an ABHA address of your choice.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="abhaAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ABHA Address</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter ABHA Address"
                        className="pr-16"
                      />
                    </FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground pointer-events-none">
                      {DOMAIN}
                    </span>
                  </div>
                  <FormDescription>
                    {rules.map((r) => (
                      <ValidationHelper key={r.content} {...r} />
                    ))}
                  </FormDescription>
                </FormItem>
              )}
            />

            {(fetchSuggestionsMutation.isPending || suggestions.length > 0) && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">
                  Suggestions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {fetchSuggestionsMutation.isPending
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20 rounded-md" />
                      ))
                    : suggestions
                        .filter((s) => s !== abhaInput)
                        .map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              form.setValue("abhaAddress", s, {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }
                            className="cursor-pointer rounded-md bg-primary px-2.5 py-1 text-xs text-white"
                          >
                            {s}
                          </button>
                        ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                !form.formState.isDirty ||
                checkAbhaAddressExistsMutation.isPending
              }
            >
              {checkAbhaAddressExistsMutation.isPending ? (
                <Loader2Icon className="text-white animate-spin scale-150" />
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

type SetPasswordProps = InjectedStepProps<FormMemory>;

export const SetPassword: FC<SetPasswordProps> = ({ memory }) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$^-])[A-Za-z\d!@#$%^&*-]{8,}$/;

  const schema = z
    .object({
      password: z.string().regex(passwordRegex, {
        message:
          "Password must be 8+ characters, 1 uppercase, 1 number, 1 special char",
      }),
      confirmPassword: z.string().nonempty({
        message: "Confirm Password is required",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const enrollAbhaAddressMutation = useMutation({
    mutationFn: mutate(routes.register.enrolAbhaAddress),
    onSuccess: () => {
      toast.success("ABHA Address created successfully");
    },
  });

  const onSubmit = () => {
    if (!memory?.transactionId || !memory?.phrProfile) return;
    enrollAbhaAddressMutation.mutate({
      transaction_id: memory.transactionId,
      phr_details: {
        ...memory.phrProfile,
        password: form.getValues("password"),
      },
    });
  };

  return (
    <Card className="mx-4 sm:w-full">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-2xl font-bold">Set Password</CardTitle>
        <CardDescription className="text-sm">
          Set a password for your ABHA address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SetPasswordSection form={form} />
            <Button
              type="submit"
              className="w-full"
              disabled={
                !form.formState.isDirty || enrollAbhaAddressMutation.isPending
              }
            >
              {enrollAbhaAddressMutation.isPending ? (
                <Loader2Icon className="text-white animate-spin scale-150" />
              ) : (
                "Create ABHA Address"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
