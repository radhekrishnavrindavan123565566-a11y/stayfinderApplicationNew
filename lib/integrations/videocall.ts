import axios from "axios";
import { logger } from "@/lib/logger";

// Video call provider types
export type VideoProvider = "zoom" | "agora" | "daily";

interface VideoRoom {
  roomId: string;
  roomUrl: string;
  provider: VideoProvider;
  expiresAt: Date;
}

interface VideoCallConfig {
  provider: VideoProvider;
  duration?: number; // in minutes
  maxParticipants?: number;
  recordingEnabled?: boolean;
}

/**
 * Initialize video call service based on provider
 */
export function getVideoCallProvider(): VideoProvider {
  const provider = process.env.NEXT_PUBLIC_VIDEO_PROVIDER as VideoProvider;

  if (!provider || !["zoom", "agora", "daily"].includes(provider)) {
    throw new Error("VIDEO_PROVIDER not configured or invalid");
  }

  return provider;
}

/**
 * Check if video call service is configured
 */
export function isVideoCallConfigured(): boolean {
  const provider = process.env.NEXT_PUBLIC_VIDEO_PROVIDER;
  if (!provider) return false;

  switch (provider) {
    case "zoom":
      return !!(
        process.env.ZOOM_CLIENT_ID &&
        process.env.ZOOM_CLIENT_SECRET &&
        process.env.ZOOM_ACCOUNT_ID
      );
    case "agora":
      return !!(process.env.AGORA_APP_ID && process.env.AGORA_APP_CERTIFICATE);
    case "daily":
      return !!process.env.DAILY_API_KEY;
    default:
      return false;
  }
}

// ─────────────────────────────────────────────────────────────────
// ZOOM SDK INTEGRATION
// ─────────────────────────────────────────────────────────────────

async function getZoomAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://zoom.us/oauth/token",
      "grant_type=account_credentials&account_id=" + process.env.ZOOM_ACCOUNT_ID,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    logger.error("[Zoom] Failed to get access token", error);
    throw error;
  }
}

async function createZoomMeeting(config: VideoCallConfig): Promise<VideoRoom> {
  try {
    const accessToken = await getZoomAccessToken();
    const zoomUserId = process.env.ZOOM_USER_ID || "me";

    const response = await axios.post(
      `https://api.zoom.us/v2/users/${zoomUserId}/meetings`,
      {
        topic: "Property Viewing",
        type: 2, // Scheduled meeting
        start_time: new Date().toISOString(),
        duration: config.duration || 60,
        timezone: process.env.TIMEZONE || "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: false,
          use_pmi: false,
          recording: config.recordingEnabled ? "cloud" : "none",
          approval_type: 0, // Automatically approve
          auto_recording: config.recordingEnabled ? "cloud" : "none",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (config.duration || 60));

    logger.info("[Zoom] Meeting created", {
      meetingId: response.data.id,
      joinUrl: response.data.join_url,
    });

    return {
      roomId: response.data.id.toString(),
      roomUrl: response.data.join_url,
      provider: "zoom",
      expiresAt,
    };
  } catch (error) {
    logger.error("[Zoom] Failed to create meeting", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────
// AGORA SDK INTEGRATION
// ─────────────────────────────────────────────────────────────────

interface AgoraRtcToken {
  appId: string;
  certificateId: string;
  channelName: string;
  uid: number;
  token: string;
}

function generateAgoraToken(channelName: string, uid: number): string {
  // Using Agora's token generation approach
  // Note: In production, use Agora's TokenBuilder from @agora-io/token-builder
  const appId = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;

  // Simplified token - in production, use proper Agora TokenBuilder
  const payload = {
    iss: appId,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    iat: Math.floor(Date.now() / 1000),
    channel: channelName,
    uid,
  };

  // In production implementation, use:
  // const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
  // const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, RtcRole.PUBLISHER, expirationTimeInSeconds);

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

async function createAgoraMeeting(config: VideoCallConfig): Promise<VideoRoom> {
  try {
    const appId = process.env.AGORA_APP_ID!;
    const channelName = `stayerra-${Date.now()}`;
    const uid = Math.floor(Math.random() * 32767) + 1;

    const token = generateAgoraToken(channelName, uid);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (config.duration || 60));

    const roomUrl = `${process.env.NEXT_PUBLIC_APP_URL}/videocall/agora?channel=${channelName}&token=${token}&appId=${appId}&uid=${uid}`;

    logger.info("[Agora] Meeting room created", {
      channelName,
      roomUrl,
    });

    return {
      roomId: channelName,
      roomUrl,
      provider: "agora",
      expiresAt,
    };
  } catch (error) {
    logger.error("[Agora] Failed to create meeting room", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────
// DAILY.CO SDK INTEGRATION
// ─────────────────────────────────────────────────────────────────

async function createDailyMeeting(config: VideoCallConfig): Promise<VideoRoom> {
  try {
    const apiKey = process.env.DAILY_API_KEY!;
    const roomName = `stayerra-${Date.now()}`;

    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        name: roomName,
        privacy: "private",
        max_participants: config.maxParticipants || 100,
        properties: {
          enable_recording: config.recordingEnabled || false,
          exp: Math.floor(Date.now() / 1000) + (config.duration || 60) * 60,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (config.duration || 60));

    logger.info("[Daily.co] Meeting room created", {
      roomName: response.data.name,
      roomUrl: response.data.url,
    });

    return {
      roomId: response.data.name,
      roomUrl: response.data.url,
      provider: "daily",
      expiresAt,
    };
  } catch (error) {
    logger.error("[Daily.co] Failed to create meeting room", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

/**
 * Create a video call room for property viewing
 */
export async function createVideoRoom(config: VideoCallConfig): Promise<VideoRoom> {
  const provider = config.provider || getVideoCallProvider();

  if (!isVideoCallConfigured()) {
    throw new Error(`Video call provider ${provider} not configured`);
  }

  switch (provider) {
    case "zoom":
      return createZoomMeeting(config);
    case "agora":
      return createAgoraMeeting(config);
    case "daily":
      return createDailyMeeting(config);
    default:
      throw new Error(`Unsupported video provider: ${provider}`);
  }
}

/**
 * Generate a video call token for client-side connection
 */
export function generateVideoToken(provider: VideoProvider, channelName: string, uid?: number): string {
  switch (provider) {
    case "agora":
      return generateAgoraToken(channelName, uid || Math.floor(Math.random() * 32767) + 1);
    default:
      throw new Error(`Token generation not supported for ${provider}`);
  }
}

/**
 * End a video call session
 */
export async function endVideoSession(provider: VideoProvider, roomId: string): Promise<void> {
  try {
    switch (provider) {
      case "zoom": {
        const accessToken = await getZoomAccessToken();
        await axios.delete(`https://api.zoom.us/v2/meetings/${roomId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        logger.info("[Zoom] Meeting ended", { meetingId: roomId });
        break;
      }

      case "daily": {
        const apiKey = process.env.DAILY_API_KEY!;
        await axios.delete(`https://api.daily.co/v1/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        logger.info("[Daily.co] Room deleted", { roomId });
        break;
      }

      case "agora":
        // Agora channels are ephemeral and don't need explicit cleanup
        logger.info("[Agora] Session ended", { channelName: roomId });
        break;
    }
  } catch (error) {
    logger.error("[Video] Failed to end session", error);
    throw error;
  }
}
