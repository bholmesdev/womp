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

export function NewSoundDropZone() {
  return (
    <Form name="new-sound" validator={newSound.validator}>
      <FileDropInput
        name="audioFile"
        className="-z-10 fixed inset-0 border rounded border-gray-200 data-[drop-target]:dark:bg-red-600"
      ></FileDropInput>
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
