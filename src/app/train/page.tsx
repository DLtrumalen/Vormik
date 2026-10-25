import type { Metadata } from "next";
import { TrainerLoader } from "@/components/trainer/TrainerLoader";

export const metadata: Metadata = {
  title: "Тренажёр — Vormik",
};

export default function TrainPage() {
  return <TrainerLoader />;
}
