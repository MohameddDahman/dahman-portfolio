import { query } from "./_generated/server";

export const getSubSkills = query({
    args: {},
    handler: async(ctx) => {
       return await ctx.db.query("subSkills").collect()
    }
})