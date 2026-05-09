import { Router } from "express";
import axios from "axios";

const router = Router();

const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY가 설정되지 않았습니다.");
  return key;
}

router.get("/channels/search", async (req, res) => {
  const { q, maxResults = "20", pageToken, minRatio = "0" } = req.query as Record<string, string>;

  if (!q || q.trim() === "") {
    res.status(400).json({ error: "검색어를 입력해주세요." });
    return;
  }

  try {
    const apiKey = getApiKey();

    const searchResponse = await axios.get(`${YT_API_BASE}/search`, {
      params: {
        part: "snippet",
        type: "channel",
        q: q.trim(),
        maxResults: Math.min(parseInt(maxResults), 50),
        pageToken: pageToken || undefined,
        key: apiKey,
      },
    });

    const items = searchResponse.data.items || [];
    if (items.length === 0) {
      res.json({ channels: [], nextPageToken: null, totalResults: 0 });
      return;
    }

    const channelIds = items
      .map((item: any) => item.snippet?.channelId || item.id?.channelId)
      .filter(Boolean)
      .join(",");

    const statsResponse = await axios.get(`${YT_API_BASE}/channels`, {
      params: {
        part: "statistics,snippet,brandingSettings",
        id: channelIds,
        key: apiKey,
      },
    });

    const channels = (statsResponse.data.items || [])
      .map((channel: any) => {
        const subs = parseInt(channel.statistics?.subscriberCount || "0");
        const views = parseInt(channel.statistics?.viewCount || "0");
        const videoCount = parseInt(channel.statistics?.videoCount || "0");
        const ratio = subs > 0 ? Math.round((views / subs) * 100) / 100 : 0;
        const avgViewsPerVideo = videoCount > 0 ? Math.round(views / videoCount) : 0;

        return {
          id: channel.id,
          title: channel.snippet?.title || "",
          description: channel.snippet?.description || "",
          thumbnail:
            channel.snippet?.thumbnails?.high?.url ||
            channel.snippet?.thumbnails?.medium?.url ||
            channel.snippet?.thumbnails?.default?.url ||
            "",
          subscribers: subs,
          totalViews: views,
          videoCount,
          viewsPerSubscriber: ratio,
          avgViewsPerVideo,
          customUrl: channel.snippet?.customUrl || "",
          country: channel.snippet?.country || "",
          publishedAt: channel.snippet?.publishedAt || "",
          hiddenScore: calculateHiddenScore(subs, views, ratio),
        };
      })
      .filter((ch: any) => ch.viewsPerSubscriber >= parseFloat(minRatio))
      .sort((a: any, b: any) => b.hiddenScore - a.hiddenScore);

    res.json({
      channels,
      nextPageToken: searchResponse.data.nextPageToken || null,
      totalResults: searchResponse.data.pageInfo?.totalResults || 0,
    });
  } catch (error: any) {
    req.log.error(error, "YouTube API error");
    const msg = error?.response?.data?.error?.message || error.message || "YouTube API 오류";
    res.status(error?.response?.status || 500).json({ error: msg });
  }
});

function calculateHiddenScore(subscribers: number, views: number, ratio: number): number {
  if (subscribers === 0 || views === 0) return 0;
  const subScore = Math.max(0, 100 - Math.log10(subscribers + 1) * 10);
  const ratioScore = Math.min(100, ratio / 10);
  return Math.round((subScore * 0.4 + ratioScore * 0.6) * 10) / 10;
}

export default router;
