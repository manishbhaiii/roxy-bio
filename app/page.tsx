"use client";

import { useState, useEffect, useRef } from "react";
import Overlay from "@/components/Overlay";
import ProfileCard, { DiscordData } from "@/components/ProfileCard";
import { config } from "@/config";
import { Volume2, VolumeX } from "lucide-react";

// Helper: Convert Hex to RGB for manual opacity
const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 8) hex = hex.substring(0, 6);
  if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
  const bigint = parseInt(hex, 16);
  if (isNaN(bigint)) return '255, 255, 255';
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

export default function Home() {
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [data, setData] = useState<DiscordData | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [bgMuted, setBgMuted] = useState(false);

  // Dynamic Title Logic
  useEffect(() => {
    if (!data?.username) return;

    // We want to animate the title. 
    // Effect: "!" ... "!" -> "i" -> "t" ...
    // The user asked for Typing animation: "@" -> "@i" -> "@it" ... -> "@its manish" -> wait -> delete one by one.

    // const originalTitle = "Link in Bio"; // Not used
    const targetTitle = `@${data.username}`; // Using username as display name logic
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const animateTitle = () => {
      if (!isDeleting) {
        // Typing
        if (currentIndex <= targetTitle.length) {
          document.title = targetTitle.substring(0, currentIndex);
          currentIndex++;
          timeoutId = setTimeout(animateTitle, 300); // Typing speed
        } else {
          // Done typing, wait before deleting
          isDeleting = true;
          timeoutId = setTimeout(animateTitle, 3000); // Stay visible for 3s
        }
      } else {
        // Deleting
        if (currentIndex >= 1) { // Stop at '@' or empty? User said "@ stop ho jaye" meaning wait at @?
          // So delete until 1 char is left ('@')
          document.title = targetTitle.substring(0, currentIndex);
          currentIndex--;
          timeoutId = setTimeout(animateTitle, 200); // Deleting speed
        } else {
          // Done deleting, restart loop
          isDeleting = false;
          timeoutId = setTimeout(animateTitle, 500);
        }
      }
    };

    timeoutId = setTimeout(animateTitle, 1000);

    // Also set Favicon
    if (data.avatar) {
      const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = data.avatar;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    return () => clearTimeout(timeoutId);
  }, [data?.username, data?.avatar]);


  const fetchData = async () => {
    try {
      const res = await fetch(`http://fi1.bot-hosting.net:5945/api/${config.discordId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const jsonData = await res.json();
      setData(jsonData.data || jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    setOverlayVisible(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 0.5;
      videoRef.current.play().catch(e => console.log("Video Play Error", e));
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (overlayVisible) return;

    if (!bgMuted) {
      videoRef.current.muted = false;
    }
  }, [overlayVisible, bgMuted]);

  const toggleBgMute = () => {
    setBgMuted(!bgMuted);
    if (videoRef.current) {
      videoRef.current.muted = !bgMuted;
    }
  };

  // Disable Right Click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Prepare RGB for button style
  const themeRgb = hexToRgb(config.themeColor || '#ffffff');

  return (
    <main className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Background Media - FORCE COVER */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
        {config.background.type === "video" ? (
          <video
            ref={videoRef}
            src={config.background.url}
            autoPlay
            loop
            muted
            playsInline
            // Use object-cover with explicit pixel checking via viewport units if needed, but min-w-full usually works
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          <img
            src={config.background.url}
            alt="Background"
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Global Mute Button */}
      {!overlayVisible && (
        <button
          onClick={toggleBgMute}
          className="fixed top-8 right-8 z-50 p-3 backdrop-blur-md rounded-2xl transition-all duration-500 cursor-pointer hover:scale-110 active:scale-95 group"
          style={{
            backgroundColor: `rgba(${themeRgb}, 0.25)`, // Colored blur background
            border: `2px solid ${config.themeColor}`,
            boxShadow: `0 0 20px ${config.themeColor}40`,
            color: config.themeColor
          }}
        >
          {bgMuted ? (
            <VolumeX className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          ) : (
            <Volume2 className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          )}
        </button>
      )}

      {/* Overlay */}
      {overlayVisible && <Overlay onEnter={handleEnter} />}

      {/* Main Profile Card */}
      {!overlayVisible && (
        <div className="z-10 relative w-full h-screen flex items-center justify-center p-4 overflow-y-auto">
          <ProfileCard
            data={data}
            loading={!data}
          />
        </div>
      )}
    </main>
  );
}
