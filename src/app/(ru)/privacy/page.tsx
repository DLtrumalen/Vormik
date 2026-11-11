import { PrivacyPolicy, privacyMetadata } from "@/components/PrivacyPolicy";

export const metadata = privacyMetadata("ru");

export default function Privacy() {
  return <PrivacyPolicy locale="ru" />;
}
