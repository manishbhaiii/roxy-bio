"use client";

import { motion } from "framer-motion";
import { Github, Music, Gamepad2, Link as LinkIcon, Eye } from "lucide-react";
import Image from "next/image";
import { config } from "@/config";
import { useState, useEffect } from "react";

// Type definitions for the API response
export interface DiscordData {
    username: string;
    globalName?: string;
    displayName?: string;
    avatar: string;
    activities: Activity[];
    status: string;
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


export default function ProfileCard({ data, loading }: ProfileCardProps) {
    const [views, setViews] = useState(0);

    useEffect(() => {
        // Fetch views from server-side API (POST increments, GET just fetches)
        // Since we want to increment on 'refresh' (load), we use POST once on mount.
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
        const parts = url.split('/');
        const hash = parts[parts.length - 1].split('.')[0];
        if (hash.startsWith("a_")) {
            return url.replace(".png", ".gif").replace(".webp", ".gif").replace(".jpg", ".gif");
        }
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

    // Filter and valid activities
    const validActivities = data.activities.filter(
        (act) => act.type === "Listening" || act.type === "Playing" || (act.name !== "Custom Status")
    );

    // Dynamic RGB for rgba styles
    const themeRgb = hexToRgb(config.themeColor || '#ffffff');

    // Display Name: Use global_name if available, else username
    const displayName = data.displayName || data.globalName || data.username;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            // Fixed width
            className="p-8 w-[550px] max-w-full bg-black/20 backdrop-blur-xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col items-center gap-6"
            style={{
                boxShadow: `0 0 40px ${config.themeColor}10`
            }}
        >
            {/* View Counter - Bottom Left */}
            <div className="absolute bottom-6 left-8 flex items-center gap-2 text-sm font-bold opacity-80 z-20">
                <Eye className="w-4 h-4" style={{ color: config.themeColor }} />
                <span style={{ color: config.themeColor }}>{views}</span>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center w-full z-10 relative mt-2">
                {/* Avatar (Birds Removed) */}
                <div className="relative flex items-center justify-center">
                    <div className="relative group">
                        <Image
                            src={avatarUrl}
                            alt="Avatar"
                            width={100}
                            height={100}
                            unoptimized
                            className="rounded-full shadow-lg group-hover:scale-105 transition-transform duration-300 object-cover"
                        />
                        <div
                            className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-black ${statusColors[data.status] || "bg-gray-500"}`}
                        />
                    </div>
                </div>

                {/* Display Name - Standard Font */}
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
            </div>

            {/* Activities Section - One Expanded Card for All Activities */}
            <div className="w-full max-w-sm flex flex-col gap-0 items-center w-full mb-4">
                {validActivities.length > 0 ? (
                    // Use one container for all activities if multiple
                    <div
                        className="w-full rounded-[30px] overflow-hidden"
                        style={{
                            // Ensure this uses the themeRgb variable derived from config
                            backgroundColor: `rgba(${themeRgb}, 0.25)`,
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        {validActivities.map((act, index) => (
                            <div
                                key={index + act.name}
                                // Removed border-b border-white/5
                                className="w-full p-3 flex items-center gap-3 relative"
                            >
                                {/* Middle: Text Info (Centered vertically) */}
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

                                {/* Right: Large Activity Image (Square) */}
                                <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-black/50">
                                    {getActivityImage(act) ? (
                                        <img src={getActivityImage(act)!} alt="Activity" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Gamepad2 className="w-6 h-6 text-white/50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* If no activity, show a placeholder pill */
                    <div
                        className="w-full rounded-[30px] p-4 flex items-center justify-center gap-3 relative overflow-hidden"
                        style={{
                            backgroundColor: `rgba(${themeRgb}, 0.1)`,
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <span className="text-sm opacity-60 font-mono" style={{ color: config.themeColor }}>No Activity Detected</span>
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
                        className="transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                        style={{
                            color: config.themeColor,
                            filter: `drop-shadow(0 0 8px ${config.themeColor})`
                        }}
                    >
                        {social.label.toLowerCase() === "github" ? <Github className="w-8 h-8" /> :
                            social.label.toLowerCase() === "discord" ? <LinkIcon className="w-8 h-8" /> :
                                social.label.toLowerCase() === "spotify" ? <Music className="w-8 h-8" /> :
                                    social.label.toLowerCase() === "instagram" ? <div className="w-8 h-8 rounded-lg border-2 border-current p-1 flex items-center justify-center"><div className="w-3 h-3 bg-current rounded-full"></div></div> :
                                        <LinkIcon className="w-8 h-8" />}
                    </a>
                ))}
            </div>

        </motion.div>
    );
}
