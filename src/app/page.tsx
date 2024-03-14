import React from "react";
import FilePicker from "@/app/components/FilePicker";
import guitarSvg from "@/app/assets/guitar.svg";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 justify-center">
        <Image src={guitarSvg} alt="Guitar" className="mb-8" width={512} />
        <h1 className="text-5xl mb-4">Welcome to Practizer</h1>
        <p className="text-base text-center">
          This app aims to help musicians to transcribe or practice a song. <br></br> Start by uploading an mp3 file!
        </p>
        <FilePicker />
      </div>
    </main>
  );
}
