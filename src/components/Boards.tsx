import { createForm } from "simple:form";
import { FileDropSubmit, FileTriggerSubmit, Form } from "./Form";
import { z } from "zod";
import { useRef, useState } from "react";
import { Button, Popover } from "react-aria-components";
import data, { type Emoji, type EmojiMartData } from "@emoji-mart/data";
import EmojiPickerMod from "@emoji-mart/react";

// I hate ESM...
const EmojiPicker = import.meta.env.SSR
  ? // @ts-expect-error
    EmojiPickerMod.default
  : EmojiPickerMod;

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
      <FileDropSubmit
        name="audioFile"
        className="dark:text-gray-600 py-6 inset-0 data-[drop-target]:dark:bg-gray-900 transition-all data-[drop-target]:scale-105 data-[drop-target]:text-white grid place-items-center rounded-md border dark:border-gray-800 border-dashed gap-3"
      >
        <span className="flex flex-col items-center gap-3">
          <DocumentArrowDown />
          Drag sounds here
          <FileTriggerSubmit name="audioFile">
            <Button className="dark:text-gray-200 dark:bg-gray-800 rounded py-2 px-4">
              Select files
            </Button>
          </FileTriggerSubmit>
        </span>
      </FileDropSubmit>
    </Form>
  );
}

type EmojiSelection = { id: string; skin?: number };

function EmojiDropdown(selection: EmojiSelection) {
  const [emojiData, setEmojiData] = useState(selection);
  const emoji = (data as EmojiMartData).emojis[emojiData.id]?.skins[
    emojiData.skin ?? 0
  ]?.native;

  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex gap-3 items-center justify-center">
      <p className="text-4xl">{emoji}</p>
      <Button
        ref={triggerRef}
        onPress={() => setIsOpen(true)}
        aria-label="Select emoji"
        className="p-2"
      >
        <ChevronDown />
      </Button>
      <Popover triggerRef={triggerRef} isOpen={isOpen} onOpenChange={setIsOpen}>
        <EmojiPicker
          data={data}
          onEmojiSelect={(s: EmojiSelection) => {
            console.log(s);
            setIsOpen(false);
            return setEmojiData(s);
          }}
        />
      </Popover>
      <input type="hidden" name="emojiId" value={emojiData.id} />
      <input type="hidden" name="emojiSkin" value={emojiData.skin} />
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
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
      <Form
        name="edit-sound"
        validator={newSound.validator}
        className="flex flex-col gap-3 h-full"
      >
        <EmojiDropdown id="airplane" />
        <input type="hidden" name="id" value={id} />

        <FileDropSubmit
          name="audioFile"
          className="data-[drop-target]:dark:bg-blue-600 flex-1"
        >
          {audioFileName}
          <FileTriggerSubmit name="audioFile">
            <Button className="dark:text-gray-200 dark:bg-gray-700 rounded py-2 px-4">
              Change
            </Button>
          </FileTriggerSubmit>
        </FileDropSubmit>
      </Form>
    </div>
  );
}
