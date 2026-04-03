import AdminLayout from "@/components/layout/AdminLayout";
import { MockDataProvider } from "@/lib/MockDataContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <MockDataProvider>
      <OnboardingProvider>
        <AdminLayout>{children}</AdminLayout>
      </OnboardingProvider>
    </MockDataProvider>
  );
}