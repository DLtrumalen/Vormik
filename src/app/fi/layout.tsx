import { RootDocument, rootMetadata, rootViewport } from "@/components/RootDocument";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function Layout({ children }: LayoutProps<"/fi">) {
  return <RootDocument lang="fi">{children}</RootDocument>;
}
