import { RootDocument, rootMetadata, rootViewport } from "@/components/RootDocument";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function Layout({ children }: LayoutProps<"/">) {
  return <RootDocument lang="ru">{children}</RootDocument>;
}
