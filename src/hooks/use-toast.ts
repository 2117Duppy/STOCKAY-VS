
import { useToast as useToastHook } from "@/components/ui/toast";

export const useToast = useToastHook;

export const toast = {
  ...useToastHook().toast,
  // Add any custom toast methods here if needed in the future
};
