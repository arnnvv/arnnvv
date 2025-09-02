import { type JSX, Suspense } from "react";
import { Write } from "@/components/Write";

export default function CreateBlogPage(): JSX.Element {
  return (
    <Suspense fallback={<>Loading...</>}>
      <Write />
    </Suspense>
  );
}
