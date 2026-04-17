import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const sendMessage = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        messageContent: v.string()
    },
    handler: async(ctx, args) => {
        await ctx.db.insert("messages", args)
    }
})