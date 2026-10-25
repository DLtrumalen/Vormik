import { Landing } from "@/components/landing/Landing";
import { siteMetadata } from "@/i18n/metadata";

export const metadata = siteMetadata("en");

export default function HomeEn() {
  return <Landing locale="en" />;
}
