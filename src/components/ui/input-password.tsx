import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";

function PasswordInput({
  className,
  ref,
  ...props
}: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-hidden"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
      </button>
    </div>
  );
}

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
