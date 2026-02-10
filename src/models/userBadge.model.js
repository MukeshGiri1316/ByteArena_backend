const userBadgeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        badgeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Badge",
            required: true,
            index: true,
        },

        awardedAt: {
            type: Date,
            default: Date.now,
        },

        awardedBy: {
            type: String,
            enum: ["SYSTEM", "ADMIN"],
            default: "SYSTEM",
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        revokeReason: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge = mongoose.model("UserBadge", userBadgeSchema);
