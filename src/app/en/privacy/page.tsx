import { PrivacyPolicy, privacyMetadata } from "@/components/PrivacyPolicy";

export const metadata = privacyMetadata("en");

export default function Privacy() {
  return <PrivacyPolicy locale="en" />;
}
