import { Landing } from "@/components/landing/Landing";
import { siteMetadata } from "@/i18n/metadata";

export const metadata = siteMetadata("fi");

export default function HomeFi() {
  return <Landing locale="fi" />;
}
