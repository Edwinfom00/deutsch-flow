import type { Metadata } from "next";
import { PlaygroundClient } from "@/modules/exercises/components/playground/PlaygroundClient";

export const metadata: Metadata = {
  title: "ÖSD Playground (dev)",
  robots: { index: false, follow: false },
};

export default function OsdPlaygroundPage() {
  return <PlaygroundClient />;
}
