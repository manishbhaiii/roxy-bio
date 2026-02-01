export const config = {
    description: `simping for 2d girls`,
    discordId: "1123856956780728411", // Use a valid ID to test
    themeColor: "#6f00ffff", // Hex color for the website theme
    spotify: true,

    ui: {
        mainCard: {
            opacity: 20, // 0-100 % (Transparency level)
            border: {
                show: false,
                width: 1, // pixels
                color: "#ffffff"
            }
        },
        activityCard: {
            opacity: 25, // 0-100 % (Background transparency)
            border: {
                show: true,
                width: 2, // pixels
                color: "#6f00ffff"
            }
        }
    },

    // Custom Badges (Overrides Discord API badges)
    customBadges: [
        "https://upload.wikimedia.org/wikipedia/commons/b/b5/Discord_Active_Developer_Badge.svg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Discord_Partner_Server_Owner_Badge.svg/640px-Discord_Partner_Server_Owner_Badge.svg.png",
    ],
    badgeStyle: {
        size: 24, // px
        opacity: 100, // 0-100 %
        gap: 8, // px
    },

    // Links: label, icon (from lucide-react), url
    // Links: label, icon (from lucide-react), url
    // Links: label, iconUrl (image path), url
    socials: [
        { label: "Github", iconUrl: "https://simpleicons.org/icons/github.svg", href: "https://github.com/your-username" },
        { label: "Discord", iconUrl: "https://simpleicons.org/icons/discord.svg", href: "https://discord.com/users/1213822891448209478" },
        { label: "Instagram", iconUrl: "https://simpleicons.org/icons/instagram.svg", href: "https://instagram.com/your-username" },
        { label: "Website", iconUrl: "https://simpleicons.org/icons/googlechrome.svg", href: "https://your-website.com" },
    ],

    // Background media
    background: {
        type: "video", // 'video' or 'image'
        url: "https://cdn.discordapp.com/attachments/1270624795549106227/1467429113856917584/youtube-RFY9RALv5XE.mp4?ex=6980595c&is=697f07dc&hm=db7727b033cc9af3dfed85a2fabb5fa87636e239631bf2f44e34a8547bc8f5c5&", // Placeholder - User to replace
    },
};
