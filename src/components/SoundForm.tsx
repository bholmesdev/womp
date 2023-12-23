import { Button } from "react-aria-components";
import { createForm } from "simple:form";
import { z } from "zod";
import { FileDropInput, Form, Input } from "./Form";
import { scope } from "simple:scope";

export const sound = createForm({
  _formName: z.string(),
  name: z.string(),
  audioFile: z.instanceof(File).refine((file) => file.type === "audio/mpeg"),
});

export function SoundForm({ databaseId }: { databaseId?: string }) {
  return (
    <Form name={databaseId ?? "_create"} validator={sound.validator}>
      <label htmlFor={scope("name")} className="sr-only">
        Name
      </label>
      <Input id={scope("name")} {...sound.inputProps.name!} />
      <FileDropInput {...sound.inputProps.audioFile!} />

      <Button type="submit">Update</Button>
    </Form>
  );
}
