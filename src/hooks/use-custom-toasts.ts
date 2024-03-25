import { buttonVariants } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export const useCustomToasts = () => {
  const loginToast = () => {
    const dismiss = toast({
      title: "Login Required",
      description: "You need to be Logged in to do that",
      variant: "destructive",
    });
  };
  return { loginToast };
};
