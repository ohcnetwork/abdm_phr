import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserSearch } from "lucide-react";
import { navigate } from "raviger";
import { Dispatch, SetStateAction, useMemo } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AbhaAddressSelector from "@/components/common/AbhaAddressSelector";

import { useAuthContext } from "@/hooks/useAuth";

import routes from "@/api";
import { VerifyAuthResponse } from "@/types/auth";
import { User } from "@/types/profile";
import { mutate, query } from "@/utils/request/request";

type SwitchProfileProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  currentAbhaAddress: string;
};

function AuthEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center pb-6 pt-4 text-muted-foreground">
      <UserSearch className="w-10 h-10 mb-2 text-gray-400" />
      <p className="text-md font-medium">No addresses found</p>
      <p className="text-sm text-center max-w-xs">
        You dont have any ABHA address linked yet to switch to. You can add a
        new ABHA address by creating a new profile.
      </p>
    </div>
  );
}

const SwitchProfile = ({
  open,
  setOpen,
  currentAbhaAddress,
}: SwitchProfileProps) => {
  const queryClient = useQueryClient();

  const { handleAuthSuccess } = useAuthContext();

  const { data, isLoading } = useQuery({
    queryKey: ["phrProfiles"],
    queryFn: query(routes.profile.phrProfiles),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const sortedProfiles = useMemo(() => {
    if (!data?.users) return [];

    const [current, others] = data.users.reduce<[User | null, User[]]>(
      ([curr, rest], user) => {
        return user.abhaAddress === currentAbhaAddress
          ? [user, rest]
          : [curr, [...rest, user]];
      },
      [null, []],
    );

    return current ? [current, ...others] : data.users;
  }, [data?.users, currentAbhaAddress]);

  const swithProfileVerifyMutation = useMutation({
    mutationFn: mutate(routes.profile.switchProfileVerify),
    onSuccess: async (data: VerifyAuthResponse) => {
      toast.success("Profile switched successfully!");
      setOpen(false);

      handleAuthSuccess(data);

      await queryClient.resetQueries();

      navigate("/");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["phrProfiles"] });
    },
  });

  const handleSwitchProfile = (selectedAddress: string) => {
    if (!selectedAddress || !data?.transaction_id) return;

    swithProfileVerifyMutation.mutate({
      abha_address: selectedAddress,
      transaction_id: data?.transaction_id || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch Profile</DialogTitle>
          {data?.users && data.users.length > 0 && (
            <DialogDescription>
              Select the profile you want to switch to.
            </DialogDescription>
          )}
        </DialogHeader>
        <AbhaAddressSelector
          addresses={sortedProfiles}
          isListLoading={isLoading}
          isActionLoading={swithProfileVerifyMutation.isPending}
          defaultSelectedAddress={currentAbhaAddress}
          onContinue={handleSwitchProfile}
          continueLabel="Switch Profile"
          emptyState={<AuthEmptyState />}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SwitchProfile;
