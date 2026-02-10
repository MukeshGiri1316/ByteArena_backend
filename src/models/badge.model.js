const badgeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            index: true, // e.g. "STREAK_30"
        },

        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        icon: {
            type: String, // image / svg / emoji
            default: "",
        },

        category: {
            type: String,
            enum: ["STREAK", "SOLVING", "CONTEST", "RANK", "SPECIAL"],
            index: true,
        },

        difficulty: {
            type: String,
            enum: ["EASY", "MEDIUM", "HARD", "LEGENDARY"],
            default: "EASY",
        },

        points: {
            type: Number,
            default: 0, // for gamification later
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Badge = mongoose.model("Badge", badgeSchema);
