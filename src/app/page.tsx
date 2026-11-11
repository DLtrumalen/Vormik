import { Landing } from "@/components/landing/Landing";
import { siteMetadata } from "@/i18n/metadata";

export const metadata = siteMetadata("ru");

export default function Home() {
  return <Landing locale="ru" />;
}
