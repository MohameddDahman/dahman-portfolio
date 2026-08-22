import type { Metadata } from "next";
import LabClient from "./LabClient";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Seven live 3D environments you can switch between, with what each one costs to run.",
};

export default function LabPage() {
  return <LabClient />;
}
