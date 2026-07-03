import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/providers/AuthProvider";
import { RoleProvider } from "@/providers/RoleProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleProvider>
          <TooltipProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              {children}
            </CartProvider>
          </TooltipProvider>
        </RoleProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
