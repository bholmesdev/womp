import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { safeId } from "../utils";
import { db, eq, Sound } from "astro:db";
import untypedData, { type EmojiMartData } from "@emoji-mart/data";

const emojiData = untypedData as EmojiMartData;

const audioFileValidator = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("audio/"));

// export const newSound = createForm({
//   audioFiles: z.array(audioFileValidator),
// });

// export const editEmoji = createForm({
//   id: z.number(),
//   emojiId: z.string(),
//   emojiSkin: z.number().optional(),
// });

// export const editFile = createForm({
//   id: z.number(),
//   audioFile: audioFileValidator,
// });

export const newSoundValidator = z.object({
  audioFiles: z.array(audioFileValidator),
  boardId: z.number(),
});

export default {
  newSound: defineAction({
    input: newSoundValidator,
    handler: async ({ audioFiles, boardId }, context) => {
      const { R2 } = context.locals.runtime.env.R2;

      for (const audioFile of audioFiles) {
        const key = `${safeId()}-${audioFile.name}`;

        await R2.put(key, await audioFile.arrayBuffer());

        const emojis = Object.values(emojiData.emojis);
        const randomIdx = Math.floor(Math.random() * emojis.length);

        await db.insert(Sound).values({
          boardId,
          emojiId: emojis[randomIdx]!.id,
          audioFileName: audioFile.name,
          audioFileKey: key,
        });
      }
    },
  }),
};
