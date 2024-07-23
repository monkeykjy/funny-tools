"use client";

import { link } from "fs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ToolList } from "@/utils";

export default function Home() {
  const router = useRouter();

  return (
    <section className="flex min-h-screen flex-row p-24">
      {ToolList.map((tool, index) => (
        <div
          key={index}
          className="m-4 rounded-md border-2 border-blue-400 h-12 w-24 text-center flex items-center justify-center cursor-pointer"
          onClick={() => router.push(tool.link)}
        >
          {tool.name}
        </div>
      ))}
    </section>
  );
}
