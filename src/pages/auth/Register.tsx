import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { navigate } from "raviger";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";

import {
  ABHA_ADDRESS_REGEX,
  ABHA_ADDRESS_VALIDATION_RULES,
  PASSWORD_REGEX,
  PIN_CODE_REGEX,
  validators,
} from "@/lib/validators";
import { ADDRESS_REGEX } from "@/lib/validators";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { useAuthContext } from "@/hooks/useAuth";
import useMultiStepForm, { InjectedStepProps } from "@/hooks/useMultiStepForm";

import { DEFAULT_AUTH_METHOD, DOMAIN, GENDERS } from "@/common/constants";

import routes from "@/api";
import {
  AbhaAddressExistsResponse,
  AuthFlowTypes,
  AuthModes,
  FormMemory,
  INITIAL_AUTH_FORM_VALUES,
  SendOtpRequest,
  VerifyAuthResponse,
  VerifyOtpResponse,
} from "@/types/auth";
import { AbhaAddressSuggestionsResponse } from "@/types/auth";
import { dateQueryString } from "@/utils";
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
        id: "add-location-details",
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
    INITIAL_AUTH_FORM_VALUES,
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

const { MOBILE_NUMBER, ABHA_NUMBER } = AuthModes;
const { ENROLLMENT } = AuthFlowTypes;

const Register = ({ memory, setMemory, goTo }: RegisterProps) => {
  const onVerifyOtpSuccess = (
    data: VerifyOtpResponse,
    sendOtpContext?: SendOtpRequest,
  ) => {
    let mobileNumber = data.abha_number?.mobile || "";

    if (sendOtpContext?.type === MOBILE_NUMBER && sendOtpContext?.value) {
      mobileNumber = sendOtpContext.value;
    }

    const [year = "", month = "", day = ""] = dateQueryString(
      data.abha_number?.date_of_birth,
    ).split("-");

    setMemory((prev) => ({
      ...prev,
      transactionId: data.transaction_id,
      existingAbhaAddresses: data.users,
      verifySystem: sendOtpContext?.otp_system || DEFAULT_AUTH_METHOD,
      phrProfile: {
        ...prev.phrProfile,
        ...data.abha_number,
        abha_address: data.abha_number?.phr_health_id ?? "",
        day_of_birth: day,
        month_of_birth: month,
        year_of_birth: year,
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

  const handleTabChange = (value: string) => {
    setMemory((prev) => ({
      ...prev,
      mode: value as AuthModes,
    }));
  };

  return (
    <Card className="mx-4">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-2xl font-bold">Register with ABHA</CardTitle>
        <CardDescription>Choose a method to register with ABHA</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={MOBILE_NUMBER}
          value={memory?.mode ?? MOBILE_NUMBER}
          onValueChange={handleTabChange}
        >
          <TabsList className="flex w-full">
            <TabsTrigger className="flex-1" value={MOBILE_NUMBER}>
              Mobile
            </TabsTrigger>
            <TabsTrigger className="flex-1" value={ABHA_NUMBER}>
              ABHA Number
            </TabsTrigger>
          </TabsList>

          <TabsContent value={MOBILE_NUMBER}>
            <MobileNumberOtpFlow
              flowType={ENROLLMENT}
              transactionId={memory?.transactionId}
              setMemory={setMemory}
              onVerifyOtpSuccess={onVerifyOtpSuccess}
            />
          </TabsContent>

          <TabsContent value={ABHA_NUMBER}>
            <AbhaNumberOtpFlow
              flowType={ENROLLMENT}
              transactionId={memory?.transactionId}
              setMemory={setMemory}
              onVerifyOtpSuccess={onVerifyOtpSuccess}
            />
          </TabsContent>

          <div className="mt-4 text-sm text-center text-gray-500">
            <span>Already have an account? </span>
            <Button
              variant="link"
              className="h-auto p-0"
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

const HandleExistingAbha = ({ memory, goTo }: HandleExistingAbhaProps) => {
  return (
    <HandleExistingAbhaAddress
      flowType={ENROLLMENT}
      memory={memory}
      goTo={goTo}
    />
  );
};

type AddBasicDetailsProps = InjectedStepProps<FormMemory>;

const AddBasicDetails = ({ memory, setMemory, goTo }: AddBasicDetailsProps) => {
  const schema = z.object({
    first_name: z.string().trim().min(2, "First name is too short"),
    middle_name: z.string().trim().optional(),
    last_name: z.string().trim().optional(),
    gender: z.enum(GENDERS, {
      error: "Gender is required",
    }),
    date_of_birth: validators.dateOfBirth,
    email: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.email({ error: "Invalid email address" }).optional(),
    ),
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
      email: undefined,
      profile_photo: "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!memory?.phrProfile) return;

    const [year = "", month = "", day = ""] = dateQueryString(
      data.date_of_birth,
    ).split("-");

    setMemory((prev) => ({
      ...prev,
      phrProfile: {
        ...prev.phrProfile,
        ...data,
        email: data.email ?? "",
        day_of_birth: day,
        month_of_birth: month,
        year_of_birth: year,
      },
    }));
    goTo("add-location-details");
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

const AddLocationDetails = ({ setMemory, goTo }: AddLocationDetailsProps) => {
  const schema = z.object({
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

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      state_code: undefined,
      state_name: "",
      district_code: undefined,
      district_name: "",
      address: "",
      pincode: "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    setMemory((prev) => ({
      ...prev,
      phrProfile: {
        ...prev.phrProfile,
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

export const ChooseAbhaAddress = ({
  memory,
  setMemory,
  goTo,
}: ChooseAbhaAddressProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const schema = z.object({
    abhaAddress: z.string().regex(ABHA_ADDRESS_REGEX),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      abhaAddress: "",
    },
  });

  const fetchSuggestionsMutation = useMutation({
    mutationFn: mutate(routes.register.abhaAddressSuggestions),
    onSuccess: (data: AbhaAddressSuggestionsResponse) => {
      const { transaction_id, abha_addresses } = data;
      setMemory((prev) => ({ ...prev, transactionId: transaction_id }));
      setSuggestions(abha_addresses.map((a) => a.replace(DOMAIN, "")));
    },
  });

  const checkAbhaAddressExistsMutation = useMutation({
    mutationFn: mutate(routes.register.checkAbhaExists),
    onSuccess: (data: AbhaAddressExistsResponse) => {
      if (data.exists) {
        toast.error("ABHA address already exists. Please choose another.");
      } else {
        setMemory((prev) => ({
          ...prev,
          phrProfile: {
            ...prev.phrProfile,
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
      !memory?.phrProfile.first_name ||
      !memory?.phrProfile.year_of_birth ||
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
  }, [memory?.transactionId, memory?.phrProfile, suggestions.length]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    const fullAddress = `${values.abhaAddress}${DOMAIN}`;
    checkAbhaAddressExistsMutation.mutate({
      abha_address: fullAddress,
    });
  };

  const abhaInput = form.watch("abhaAddress");

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
                    {ABHA_ADDRESS_VALIDATION_RULES(abhaInput).map((r) => (
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
                            className="cursor-pointer rounded-md bg-primary px-2.5 py-1 text-xs text-white hover:bg-primary/90 transition-colors"
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
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Checking...
                </>
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

export const SetPassword = ({ memory }: SetPasswordProps) => {
  const { handleAuthSuccess } = useAuthContext();

  const [open, setOpen] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [clickedAction, setClickedAction] = useState<"set" | "skip" | null>(
    null,
  );

  const schema = z
    .object({
      password: z
        .string()
        .trim()
        .optional()
        .refine((val) => !val || PASSWORD_REGEX.test(val), {
          error: "",
        }),
      confirmPassword: z.string().trim().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const enrolAbhaAddressMutation = useMutation({
    mutationFn: mutate(routes.register.enrolAbhaAddress),
    onSuccess: (data: VerifyAuthResponse) => {
      toast.success("ABHA Address created successfully");
      handleAuthSuccess(data);
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    if (!memory?.transactionId || !memory?.phrProfile) return;
    enrolAbhaAddressMutation.mutate({
      transaction_id: memory.transactionId,
      phr_details: {
        ...memory.phrProfile,
        password: values.password ?? "",
      },
    });
  };

  const handleSetPassword = () => {
    setClickedAction("set");
    form.handleSubmit(onSubmit)();
  };

  const handleSkipPassword = () => {
    setClickedAction("skip");
    onSubmit({ password: "", confirmPassword: "" });
  };

  const handleAgreeToTerms = () => {
    setHasAgreedToTerms(true);
    setOpen(false);
  };

  return (
    <Card className="mx-4 sm:w-full">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-2xl font-bold">Final Step</CardTitle>
        <CardDescription className="text-sm">
          Set a password for your ABHA address for seamless login experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form className="space-y-4">
            <SetPasswordSection form={form} />

            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <Checkbox
                id="terms"
                checked={hasAgreedToTerms}
                onCheckedChange={(checked) =>
                  setHasAgreedToTerms(Boolean(checked))
                }
                className="mt-1 text-white"
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium block leading-snug"
                >
                  I agree to the{" "}
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 h-auto align-baseline"
                      >
                        Terms and Conditions
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Terms & Conditions</DialogTitle>
                        <DialogDescription asChild>
                          <div className="text-sm text-muted-foreground space-y-2 max-h-60 overflow-y-auto pr-4">
                            <p>
                              1. You agree to link your health records securely
                              with your ABHA address.
                            </p>
                            <p>
                              2. You consent to share your health data with
                              verified providers on approval.
                            </p>
                            <p>
                              3. Your data is protected under ABDM and won't be
                              shared without consent.
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Close</Button>
                        </DialogClose>
                        <Button onClick={handleAgreeToTerms}>Agree</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Label>
                <p className="text-xs text-gray-500">
                  By checking this box, you confirm that you've read and
                  understood our terms.
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <Button
                type="button"
                className="w-full"
                onClick={handleSetPassword}
                disabled={
                  !form.formState.isDirty ||
                  !hasAgreedToTerms ||
                  enrolAbhaAddressMutation.isPending
                }
              >
                {enrolAbhaAddressMutation.isPending &&
                clickedAction === "set" ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Set Password"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSkipPassword}
                disabled={
                  !hasAgreedToTerms || enrolAbhaAddressMutation.isPending
                }
              >
                {enrolAbhaAddressMutation.isPending &&
                clickedAction === "skip" ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Skip and Create Account"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
