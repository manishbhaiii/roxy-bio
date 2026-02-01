"use client";

import { motion } from "framer-motion";
import {
    Github, Music, Gamepad2, Link as LinkIcon, Eye,
    Twitter, Instagram, Youtube, Twitch, Mail, Globe, Cloud
} from "lucide-react";
import Image from "next/image";
import { config } from "@/config";
import { useState, useEffect } from "react";

// --- Types based on User's JSON ---

export interface DiscordData {
    userId: string;
    username: string;
    discriminator: string;
    globalName?: string;
    displayName?: string;
    avatar: string;
    avatarDecoration?: {
        asset: string;
        skuId: string;
        url: string;
    };
    banner?: {
        hash: string;
        url: string;
        color: string | null;
    };
    badges: {
        name: string;
        icon: string;
        value: number;
    }[];
    nitro: {
        type: number;
        hasNitro: boolean;
    };
    clanTag?: {
        guildId: string;
        tag: string;
        identityEnabled: boolean;
        badge: string; // URL to badge image
    };
    status: string;
    activities: Activity[];
}

interface Activity {
    name: string;
    type: string;
    details?: string;
    state?: string;
    applicationId?: string;
    assets?: {
        largeImage?: string;
        smallImage?: string;
        largeText?: string;
        smallText?: string;
    };
    spotify?: {
        albumArt?: string;
        songName?: string;
        artistName?: string;
        trackURL?: string;
    };
    timestamps?: {
        start?: string;
        end?: string;
    };
}

interface ProfileCardProps {
    data: DiscordData | null;
    loading: boolean;
}

const statusColors: Record<string, string> = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    offline: "bg-gray-500",
};

// Helper: Convert Hex to RGB for manual opacity
const hexToRgb = (hex: string) => {
    hex = hex.replace(/^#/, '');

    // Handle 8-digit hex (RRGGBBAA) - strip alpha
    if (hex.length === 8) {
        hex = hex.substring(0, 6);
    }

    // Handle 3-digit hex (RGB)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) return '255, 255, 255'; // Fallback

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
};

// Social Icon Map
const SOCIAL_ICONS: Record<string, any> = {
    "Github": Github,
    "Discord": LinkIcon, // Using Link as Discord icon fallback or we can use specific if we had it but Lucide doesn't have Discord. Usually people use FaDiscord from react-icons/fa. But user said "lucide-react". We'll stick to generic or Link for unavailable. 
    // Actually, Lucide doesn't have brand icons like Discord/Spotify usually? 
    // Wait, previous code used <Music> for Spotify.
    "Spotify": Music,
    "Instagram": Instagram,
    "Twitter": Twitter,
    "Youtube": Youtube,
    "Twitch": Twitch,
    "Mail": Mail,
    "Globe": Globe,
    "Website": Globe,
    "Cloud": Cloud,
    "Link": LinkIcon
};

// Badge Icon Mapping (Using standard names from API)
// Using a reliable source for SVG badges or falling back to text
const BADGE_ICONS: Record<string, string> = {
    "hypesquad_brilliance": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/hypesquad_brilliance.svg",
    "hypesquad_bravery": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/hypesquad_bravery.svg",
    "hypesquad_balance": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/hypesquad_balance.svg",
    "staff": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/staff.svg",
    "partner": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/partner.svg",
    "certified_moderator": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/certified_moderator.svg",
    "verified_developer": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/verified_developer.svg",
    "active_developer": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/active_developer.svg",
    "early_supporter": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/early_supporter.svg",
    "nitro": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/nitro.svg",
    "boost": "https://raw.githubusercontent.com/rniss/discord-badges/main/assets/badges/boost.svg", // Generic boost, API usually gives specific level
};

export default function ProfileCard({ data, loading }: ProfileCardProps) {
    const [views, setViews] = useState(0);

    useEffect(() => {
        // Fetch views from server-side API (POST increments, GET just fetches)
        const updateViews = async () => {
            try {
                const res = await fetch('/api/views', { method: 'POST' });
                const json = await res.json();
                setViews(json.views);
            } catch (e) {
                console.error("Failed to update views", e);
            }
        };
        updateViews();
    }, []);

    if (loading || !data) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ borderColor: `${config.themeColor}50`, color: config.themeColor }}
                className="w-[550px] h-[350px] bg-black/30 backdrop-blur-md rounded-xl border flex items-center justify-center transition-all duration-300"
            >
                <div
                    style={{ borderColor: config.themeColor, borderTopColor: 'transparent' }}
                    className="w-8 h-8 border-2 rounded-full animate-spin"
                />
            </motion.div>
        );
    }

    // --- LOGIC ---
    const getAvatarUrl = (url: string | undefined) => {
        if (!url) return "";
        // If it's a gif (starts with a_), replace extension
        // The API actually returns the correct URL in the 'avatar' field mostly, but let's be safe
        // The user provided JSON has: ".../a_...gif?size=512" which is good.
        return url;
    };

    const avatarUrl = getAvatarUrl(data.avatar);

    const fixDiscordUrl = (url: string | undefined) => {
        if (!url) return null;
        if (url.includes("mp:attachments/")) {
            const parts = url.split("mp:attachments/");
            if (parts.length > 1) {
                let fixed = `https://cdn.discordapp.com/attachments/${parts[1]}`;
                if (fixed.endsWith(".png") && fixed.includes("?")) {
                    fixed = fixed.slice(0, -4);
                }
                return fixed;
            }
        }
        return url;
    };

    const getActivityImage = (activity: Activity) => {
        if (activity.spotify?.albumArt) return activity.spotify.albumArt;
        if (activity.assets?.largeImage) {
            if (activity.assets.largeImage.startsWith("spotify:")) {
                const artId = activity.assets.largeImage.replace("spotify:", "");
                return `https://i.scdn.co/image/${artId}`;
            }
            if (activity.assets.largeImage.startsWith("http")) {
                return fixDiscordUrl(activity.assets.largeImage);
            }
        }
        return null;
    };

    // Filter valid activities
    const validActivities = data.activities.filter(
        (act) => act.type === "Listening" || act.type === "Playing" || (act.name !== "Custom Status")
    );

    // Dynamic RGB for rgba styles
    const themeRgb = hexToRgb(config.themeColor || '#ffffff');

    // Display Name Strategy
    const displayName = data.displayName || data.globalName || data.username;

    // Badge Logic - Using Custom Badges from Config
    // User requested to remove old badge system but keep tag.
    const customBadges = config.customBadges || [];

    // UI Styles from config
    const mainCardStyle = {
        boxShadow: `0 0 40px ${config.themeColor}10`,
        backgroundColor: `rgba(0, 0, 0, ${config.ui?.mainCard?.opacity ? config.ui.mainCard.opacity / 100 : 0.2})`,
        border: config.ui?.mainCard?.border?.show
            ? `${config.ui.mainCard.border.width}px solid ${config.ui.mainCard.border.color}`
            : 'none'
    };

    const activityCardStyle = {
        backgroundColor: `rgba(${themeRgb}, ${config.ui?.activityCard?.opacity ? config.ui.activityCard.opacity / 100 : 0.25})`,
        backdropFilter: "blur(12px)",
        border: config.ui?.activityCard?.border?.show
            ? `${config.ui.activityCard.border.width}px solid ${config.ui.activityCard.border.color}`
            : 'none'
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 w-[550px] max-w-full backdrop-blur-xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col items-center gap-6"
            style={mainCardStyle}
        >
            {/* View Counter - Bottom Left */}
            <div className="absolute bottom-6 left-8 flex items-center gap-2 text-sm font-bold opacity-80 z-20">
                <Eye className="w-4 h-4" style={{ color: config.themeColor }} />
                <span style={{ color: config.themeColor }}>{views}</span>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center w-full z-10 relative mt-2">

                {/* Avatar Area */}
                <div className="relative flex items-center justify-center">
                    <div className="relative group w-[100px] h-[100px]">
                        <Image
                            src={avatarUrl}
                            alt="Avatar"
                            fill
                            unoptimized
                            className="rounded-full shadow-lg group-hover:scale-105 transition-transform duration-300 object-cover z-10"
                        />
                        {/* Status Indicator */}
                        <div
                            className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-black ${statusColors[data.status] || "bg-gray-500"} z-20`}
                        />

                        {/* Avatar Decoration - Overlay */}
                        {data.avatarDecoration && (
                            <div className="absolute -top-[15%] -left-[15%] w-[130%] h-[130%] pointer-events-none z-30">
                                <img
                                    src={data.avatarDecoration.url}
                                    alt="decoration"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Display Name */}
                <h1
                    style={{
                        textShadow: `0 0 15px ${config.themeColor}`,
                        color: config.themeColor,
                        fontFamily: 'sans-serif'
                    }}
                    className="mt-4 text-4xl font-bold tracking-wider text-center"
                >
                    {displayName}
                </h1>

                {/* Badges & Clan Tag Row */}
                {/* User requested Badges FIRST, then Clan Tag LAST */}
                <div
                    className="flex flex-wrap items-center justify-center mt-2 px-4"
                    style={{ gap: config.badgeStyle?.gap || 8 }}
                >
                    {/* Custom Badges */}
                    {customBadges.map((badgeUrl, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-center relative hover:scale-110 transition-transform duration-200"
                            style={{
                                width: config.badgeStyle?.size || 24,
                                height: config.badgeStyle?.size || 24,
                                opacity: (config.badgeStyle?.opacity || 100) / 100,
                            }}
                        >
                            <img
                                src={badgeUrl}
                                alt="badge"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ))}

                    {/* Clan Tag */}
                    {data.clanTag && (
                        <div
                            className="flex items-center gap-1 border border-[#ffffff10] px-1.5 py-0.5 h-[22px]"
                            style={{
                                backgroundColor: "rgba(0, 0, 0, 0.3)", // More transparent as requested
                                borderRadius: "8px", // More rounded corners
                            }}
                            title={data.clanTag.tag}
                        >
                            {data.clanTag.badge && (
                                <img src={data.clanTag.badge} alt="clan" className="w-[12px] h-[12px] object-contain" />
                            )}
                            <span className="text-[11px] font-medium text-[#dbdee1] font-sans tracking-wide">
                                {data.clanTag.tag}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Activities Section */}
            <div className="w-full max-w-sm flex flex-col gap-0 items-center w-full mb-4">
                {validActivities.length > 0 && (
                    <div
                        className="w-full rounded-[30px] overflow-hidden"
                        style={activityCardStyle}
                    >
                        {validActivities.map((act, index) => (
                            <div
                                key={index + act.name}
                                className="w-full p-3 flex items-center gap-4 relative"
                            >
                                {/* Middle: Text Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center pl-4">
                                    <p className="text-xs font-medium truncate" style={{ color: config.themeColor }}>
                                        {act.name === "Spotify" ? "Listening to Spotify" : `Playing ${act.name}`}
                                    </p>
                                    <p className="text-[10px] text-white/60 truncate">
                                        {act.details || act.state || "Just lounging"}
                                    </p>
                                    {act.type !== "Listening" && act.state && act.name !== "Spotify" && (
                                        <p className="text-[10px] text-white/40 truncate">
                                            {act.state}
                                        </p>
                                    )}
                                </div>

                                {/* Right: Large Activity Image */}
                                <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-black/50 mr-2">
                                    {getActivityImage(act) ? (
                                        <img src={getActivityImage(act)!} alt="Activity" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Gamepad2 className="w-8 h-8 text-white/50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center justify-center gap-6 pb-6">
                {config.socials.map((social: any) => (
                    <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:scale-110 hover:-translate-y-1 block"
                        style={{
                            filter: `drop-shadow(0 0 8px ${config.themeColor})`
                        }}
                    >
                        {/* Force Color Icon using Mask */}
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: config.themeColor,
                                WebkitMaskImage: `url(${social.iconUrl})`,
                                maskImage: `url(${social.iconUrl})`,
                                WebkitMaskSize: 'contain',
                                maskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                maskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                                maskPosition: 'center',
                            }}
                        />
                    </a>
                ))}
            </div>

        </motion.div>
    );
}
