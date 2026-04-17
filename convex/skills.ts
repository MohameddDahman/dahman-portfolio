
import { query } from "./_generated/server";

export const getSkills = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("skills").collect();
  },
});

