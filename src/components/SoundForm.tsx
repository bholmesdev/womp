import { useState } from "react";
import { Button, DropZone, type FileDropItem } from "react-aria-components";
import { createForm } from "simple:form";
import { z } from "zod";
import { Form, Input } from "./Form";
import { scope } from "simple:scope";

export const sound = createForm({
  _formName: z.string(),
  name: z.string(),
  audioUrl: z.string().url(),
});

export function SoundForm({ databaseId }: { databaseId?: string }) {
  const [file, setFile] = useState<FileDropItem | null>(null);

  return (
    <Form name={databaseId ?? "_create"} validator={sound.validator}>
      <label htmlFor={scope("name")} className="sr-only">
        Name
      </label>
      <Input id={scope("name")} {...sound.inputProps.name!} />

      <DropZone
        className="border rounded border-purple-300 p-4"
        getDropOperation={(types) =>
          types.has("audio/mpeg") ? "copy" : "cancel"
        }
        onDrop={(e) => {
          const file = e.items.find((file) => file.kind === "file") as
            | FileDropItem
            | undefined;
          if (!file) return;
          setFile(file);
        }}
      >
        <p slot="label">{file?.name || "Drop files here"}</p>
      </DropZone>

      <Input {...sound.inputProps.audioUrl!} type="hidden" value={file?.name} />
      <Button type="submit">Update</Button>
    </Form>
  );
}
