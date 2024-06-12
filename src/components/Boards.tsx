import { createForm } from "simple:form";
import {
  FileDropSubmit,
  FileTriggerSubmit,
  Form,
  useFormContext,
  useSubmit,
} from "./Form";
import { z } from "zod";
import { useRef, useState } from "react";
import { Button, Popover } from "react-aria-components";
import data, { type EmojiMartData } from "@emoji-mart/data";
import EmojiPickerMod from "@emoji-mart/react";
import { newSoundValidator } from "../actions";

// I hate ESM...
const EmojiPicker = import.meta.env.SSR
  ? // @ts-expect-error
    EmojiPickerMod.default
  : EmojiPickerMod;

const audioFileValidator = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("audio/"));

export const newSound = createForm({
  audioFiles: z.array(audioFileValidator),
});

export const editEmoji = createForm({
  id: z.number(),
  emojiId: z.string(),
  emojiSkin: z.number().optional(),
});

export const editFile = createForm({
  id: z.number(),
  audioFile: audioFileValidator,
});

function DocumentArrowDown() {
  audioFileValidator.nullable().parse(null);
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
      validator={newSoundValidator}
      style={{ viewTransitionName: "new-sound" }}
    >
      <FileDropSubmit
        name="audioFiles"
        allowsMultiple
        className="dark:text-gray-600 py-8 inset-0 data-[drop-target]:dark:bg-gray-900 transition-all data-[drop-target]:scale-105 data-[drop-target]:text-white grid place-items-center rounded-md border dark:border-gray-800 border-dashed gap-3"
      >
        <span className="flex flex-col items-center gap-3">
          <DocumentArrowDown />
          Drag sounds here
          <FileTriggerSubmit name="audioFiles" allowsMultiple>
            <Button className="dark:text-gray-200 dark:bg-gray-800 rounded py-2 px-4">
              Select files
            </Button>
          </FileTriggerSubmit>
        </span>
      </FileDropSubmit>
    </Form>
  );
}

type EmojiSelection = { id: string; skin: number | undefined };

function EmojiDropdown(selection: EmojiSelection) {
  const [emojiData, setEmojiData] = useState(selection);
  const emoji = (data as EmojiMartData).emojis[emojiData.id]?.skins[
    emojiData.skin ?? 0
  ]?.native;

  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formContext = useFormContext();
  const submit = useSubmit(formContext);

  return (
    <>
      <Button
        ref={triggerRef}
        onPress={() => setIsOpen(true)}
        aria-label="Select emoji"
        className="w-full flex gap-3 items-center justify-center"
      >
        <span className="text-3xl">{emoji}</span>
        <ChevronDown />
      </Button>

      <Popover triggerRef={triggerRef} isOpen={isOpen} onOpenChange={setIsOpen}>
        <EmojiPicker
          data={data}
          onEmojiSelect={(s: EmojiSelection) => {
            const formData = new FormData(
              formContext.formRef?.current ?? undefined
            );
            formData.set("emojiId", s.id);
            formData.set("emojiSkin", s.skin?.toString() ?? "");
            submit(formData);
            setIsOpen(false);
            return setEmojiData(s);
          }}
        />
      </Popover>
      <input type="hidden" name="emojiId" value={emojiData.id} />
      <input type="hidden" name="emojiSkin" value={emojiData.skin} />
    </>
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
  emojiId,
  emojiSkin,
  audioFileKey,
  audioFileName,
}: {
  id: number;
  emojiId: string;
  emojiSkin: number | undefined;
  audioFileKey: string;
  audioFileName: string;
}) {
  let audioRef = useRef<HTMLAudioElement>(null);
  return (
    <div className="aspect-square rounded dark:bg-gray-800 dark:border-gray-700 p-4 flex flex-col gap-3">
      <Form name="edit-emoji" validator={editEmoji.validator}>
        <input type="hidden" name="id" value={id} />
        <EmojiDropdown id={emojiId} skin={emojiSkin} />
      </Form>
      <Form name="edit-file" className="flex-1" validator={editFile.validator}>
        <input type="hidden" name="id" value={id} />
        <FileDropSubmit
          name="audioFile"
          className="h-full grid place-items-center rounded border data-[drop-target]:dark:border-gray-600 border-dashed border-transparent"
        >
          <div className="flex flex-col items-center gap-3">
            <Button
              aria-label="Play sound"
              className="flex items-center max-w-44 gap-2"
              onPress={() => {
                if (!audioRef.current) {
                  audioRef = { current: new Audio(`/audio/${audioFileKey}`) };
                }

                audioRef.current!.currentTime = 0;
                audioRef.current!.play();
              }}
            >
              <span className="truncate">{audioFileName}</span>
              <PlayIcon />
            </Button>
            <FileTriggerSubmit name="audioFile">
              <Button className="dark:text-gray-200 dark:bg-gray-700 rounded py-2 px-4">
                Change
              </Button>
            </FileTriggerSubmit>
          </div>
        </FileDropSubmit>
      </Form>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-8 h-8"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
