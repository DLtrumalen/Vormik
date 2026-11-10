import type { Metadata, Viewport } from "next";
import { TrainerLoader } from "@/components/trainer/TrainerLoader";
import { THEME_SCRIPT } from "@/lib/theme-script";

export const metadata: Metadata = {
  title: "Vormik",
};

// У приложения своя тёмная системная строка, отличная от сайта.
export const viewport: Viewport = {
  themeColor: "#0b1220",
  viewportFit: "cover",
};

export default function TrainPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <TrainerLoader />
    </>
  );
}
