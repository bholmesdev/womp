import { createForm } from "simple:form";
import { FileDropInput, Form } from "./Form";
import { z } from "zod";
import { useRef } from "react";

const audioFileValidator = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("audio/"));

export const newSound = createForm({
  audioFile: audioFileValidator,
});

export const editSound = createForm({
  id: z.string(),
  audioFile: audioFileValidator,
});

function DocumentArrowDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

export function NewSoundDropZone() {
  return (
    <Form
      name="new-sound"
      className="grid place-items-stretch p-3"
      validator={newSound.validator}
      style={{ viewTransitionName: "new-sound" }}
    >
      <FileDropInput
        name="audioFile"
        className="dark:text-gray-600 py-10 inset-0 data-[drop-target]:dark:bg-gray-900 transition-all data-[drop-target]:scale-105 data-[drop-target]:text-white grid place-items-center rounded-md border dark:border-gray-800 border-dashed"
      >
        <span className="flex flex-col items-center gap-3">
          <DocumentArrowDown />
          Drag your sounds here
        </span>
      </FileDropInput>
    </Form>
  );
}

export function EditCard({
  id,
  audioFileKey,
  audioFileName,
}: {
  id: string;
  audioFileKey: string;
  audioFileName: string;
}) {
  let audioRef = useRef<HTMLAudioElement>(null);
  return (
    <div className="aspect-square rounded dark:bg-gray-800 dark:border-gray-700">
      <button
        onClick={() => {
          if (!audioRef.current) {
            audioRef = { current: new Audio(`/audio/${audioFileKey}`) };
          }

          audioRef.current!.currentTime = 0;
          audioRef.current!.play();
        }}
      >
        Play
      </button>
      <Form name="edit-sound" validator={newSound.validator}>
        <input type="hidden" name="id" value={id} />

        <FileDropInput
          name="audioFile"
          className="data-[drop-target]:dark:bg-blue-600"
        >
          {audioFileName}
        </FileDropInput>
      </Form>
    </div>
  );
}
