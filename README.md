# Configuration Documentation

This file explains how to customize your website using the `config.ts` file. This is the central control panel for your site's appearance and content.

## Configuration Template

Below is the structure of the configuration file. You can copy this or reference it when making changes.

```typescript
export const config = {
    // Basic Information
    description: "Your brief bio or description here",
    discordId: "YOUR_DISCORD_USER_ID", // Required for fetching profile data
    themeColor: "#6f00ffff", // Main accent color (Hex code)
    spotify: true, // Toggle Spotify integration features

    // UI Customization
    ui: {
        mainCard: {
            opacity: 20, // Background opacity (0-100)
            border: {
                show: false, // Toggle border
                width: 1, // Border width in pixels
                color: "#ffffff" // Border color
            }
        },
        activityCard: {
            opacity: 25, // Background opacity (0-100)
            border: {
                show: true,
                width: 2,
                color: "#6f00ffff"
            }
        }
    },

    // Badges Section
    // Displayed below your name. Use direct image URLs.
    customBadges: [
        "https://example.com/badge1.png",
        "https://example.com/badge2.svg",
    ],
    badgeStyle: {
        size: 24, // Size in pixels
        opacity: 100, // Opacity (0-100)
        gap: 8, // Space between badges in pixels
    },

    // Social Links
    // Displayed at the bottom of the card.
    socials: [
        { 
            label: "Github", 
            iconUrl: "https://simpleicons.org/icons/github.svg", 
            href: "https://github.com/your-username" 
        },
        // Add more links as needed
    ],

    // Background Settings
    background: {
        type: "video", // Options: 'video' or 'image'
        url: "URL_TO_YOUR_BACKGROUND_FILE", // Direct link to image or video
    },
};
```

## Detailed Explanations

### Basic Information
- **description**: A short text string describing yourself.
- **discordId**: Your 18-digit Discord User ID. This is used to fetch your avatar, status, and activities from the Lanyard API or compatible proxy.
- **themeColor**: The primary color used for text highlights, borders, glows, and icons. Must be a valid Hex color code (e.g., `#FF0000` for red).
- **spotify**: Set to `true` or `false`. Controls if Spotify-specific features or layouts should be enabled (currently merged into Activity Card).

### UI Customization (ui)
This section controls the glassmorphism look of the cards.
- **mainCard**: The large central card containing your profile.
  - **opacity**: Controls how transparent the background is. Lower values = more transparent. 
  - **border**: Settings to draw a line around the card.
- **activityCard**: The smaller card showing your current game or music.
  - **show**: If false, the border is hidden.

### Badges (customBadges & badgeStyle)
- **customBadges**: An array of strings. Each string must be a URL to an image file (SVG, PNG, etc.) representing a badge. These replace the default Discord badges.
- **badgeStyle**: Global settings for all badges.
  - **size**: Height and width of badges in pixels.
  - **opacity**: Transparency of the badges.
  - **gap**: Horizontal spacing between badges.

### Social Links (socials)
An array of objects representing your social media links.
- **label**: Name of the platform (e.g., "Twitter").
- **iconUrl**: URL to the icon image. You can use services like SimpleIcons or host your own. The icon will be automatically colored to match your `themeColor`.
- **href**: The link to your profile.

### Background
- **type**: Set to either `"video"` or `"image"`.
- **url**: The direct URL to the background resource. If using a video, ensure it is a format supported by browsers (like MP4) and allow direct playback.
