import { column, defineDb, defineTable } from "astro:db";

const Sound = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    // boardId: column.number({
    //   references: () => Board.columns.id,
    // }),
    emojiId: column.text(),
    emojiSkin: column.number({
      optional: true,
    }),
    name: column.text({
      optional: true,
    }),
    audioFileKey: column.text({
      unique: true,
    }),
    audioFileName: column.text(),
  },
});

const Board = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Sound, Board },
});
