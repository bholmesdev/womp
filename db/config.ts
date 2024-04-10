import { column, defineDb, defineTable } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({
      primaryKey: true,
    }),
    github_id: column.text({ unique: true }),
    username: column.text(),
  },
});

const Session = defineTable({
  columns: {
    id: column.text({
      primaryKey: true,
    }),
    expiresAt: column.date(),
    userId: column.text({
      references: () => User.columns.id,
    }),
  },
});

const Sound = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    boardId: column.number({
      references: () => Board.columns.id,
    }),
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
    userId: column.text({
      references: () => User.columns.id,
    }),
    name: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Sound, Board, User, Session },
});
