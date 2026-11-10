import { PrivacyPolicy, privacyMetadata } from "@/components/PrivacyPolicy";

export const metadata = privacyMetadata("fi");

export default function Privacy() {
  return <PrivacyPolicy locale="fi" />;
}
