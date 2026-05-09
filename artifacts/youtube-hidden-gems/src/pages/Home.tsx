import { useState, useCallback } from "react";
import { Search, TrendingUp, Users, Eye, Video, ExternalLink, Sparkles, Filter, ChevronDown, BookOpen, X } from "lucide-react";

interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  viewsPerSubscriber: number;
  avgViewsPerVideo: number;
  customUrl: string;
  country: string;
  publishedAt: string;
  hiddenScore: number;
}

interface SearchResult {
  channels: Channel[];
  nextPageToken: string | null;
  totalResults: number;
}

function formatNumber(n: number): string {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toLocaleString();
}

function RatioBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, #6A0DAD, #FF0090, #FF6700, #CCFF00)",
        }}
      />
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "#CCFF00" : score >= 40 ? "#FF6700" : "#FF0090";
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}66`,
        color,
      }}
    >
      <Sparkles size={10} />
      숨겨진 점수 {score.toFixed(0)}
    </div>
  );
}

function ChannelCard({ channel, maxRatio }: { channel: Channel; maxRatio: number }) {
  return (
    <div className="card-psychedelic rounded-2xl p-5 flex flex-col gap-4 group cursor-pointer"
      onClick={() => window.open(`https://youtube.com/channel/${channel.id}`, "_blank")}>
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={channel.thumbnail}
            alt={channel.title}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-600/40 group-hover:ring-orange-500/60 transition-all"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=6A0DAD&color=fff&size=64`;
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center">
            <TrendingUp size={10} className="text-black" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-base leading-tight line-clamp-1 group-hover:text-orange-400 transition-colors">
              {channel.title}
            </h3>
            <ExternalLink size={14} className="text-violet-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {channel.customUrl && (
            <p className="text-violet-400 text-xs mt-0.5">@{channel.customUrl.replace("@", "")}</p>
          )}
          <p className="text-white/50 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {channel.description || "채널 설명 없음"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-violet-400 mb-1">
            <Users size={11} />
            <span className="text-[10px]">구독자</span>
          </div>
          <p className="font-bold text-white text-sm">{formatNumber(channel.subscribers)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
            <Eye size={11} />
            <span className="text-[10px]">총 조회수</span>
          </div>
          <p className="font-bold text-white text-sm">{formatNumber(channel.totalViews)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-pink-400 mb-1">
            <Video size={11} />
            <span className="text-[10px]">영상 수</span>
          </div>
          <p className="font-bold text-white text-sm">{formatNumber(channel.videoCount)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-violet-300 flex items-center gap-1">
            <TrendingUp size={11} />
            조회수 / 구독자 비율
          </span>
          <span className="font-bold" style={{ color: "#CCFF00" }}>
            {channel.viewsPerSubscriber >= 1000
              ? formatNumber(Math.round(channel.viewsPerSubscriber))
              : channel.viewsPerSubscriber.toFixed(1)}x
          </span>
        </div>
        <RatioBar value={channel.viewsPerSubscriber} max={maxRatio} />
      </div>

      <div className="flex items-center justify-between">
        <ScoreBadge score={channel.hiddenScore} />
        <p className="text-white/30 text-[10px]">
          평균 영상 조회수: {formatNumber(channel.avgViewsPerVideo)}
        </p>
      </div>
    </div>
  );
}

function OrgBlob({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`organic-blob blob-morph ${className ?? ""}`} style={style} />;
}

const CATEGORIES = [
  { label: "전체", value: "" },
  { label: "AI동화", value: "AI animation story" },
  { label: "음악", value: "music" },
  { label: "교육", value: "education" },
  { label: "요리", value: "cooking" },
  { label: "여행", value: "travel" },
  { label: "기술/IT", value: "technology" },
  { label: "피트니스", value: "fitness workout" },
  { label: "뷰티", value: "beauty makeup" },
  { label: "브이로그", value: "vlog daily" },
];

const QUICK_SEARCHES = [
  { label: "🍳 한국 요리", value: "한국 요리" },
  { label: "🎸 인디 음악", value: "indie music" },
  { label: "🎻 클래식 기타", value: "classical guitar" },
  { label: "🎮 인디 게임", value: "indie game" },
  { label: "📚 독학 영어", value: "독학 영어" },
  { label: "🎨 디지털 아트", value: "digital art" },
  { label: "🧘 명상", value: "meditation" },
  { label: "🚀 스타트업", value: "startup" },
];

const HOW_TO_STEPS = [
  { num: 1, color: "#C4845A", title: "키워드 입력", desc: '검색창에 원하는 주제를 짧은 키워드로 입력하세요. (예: "한국 요리", "인디 음악", "클래식 기타")' },
  { num: 2, color: "#8B9D77", title: "카테고리 버튼 클릭", desc: "게임·음악·교육 등 카테고리 버튼을 클릭하면 해당 주제의 채널을 바로 탐색할 수 있습니다." },
  { num: 3, color: "#C07A95", title: "숨겨진 점수 확인", desc: "숨겨진 점수가 높을수록 구독자 대비 조회수가 폭발적인 채널입니다. 아직 알려지지 않은 다이아몬드 원석!" },
  { num: 4, color: "#8A80A8", title: "채널 방문", desc: "마음에 드는 채널 카드를 클릭하면 해당 유튜브 채널로 바로 이동합니다." },
  { num: 5, color: "#B07850", title: "고급 필터 활용", desc: "고급 필터를 열어 최대 구독자 수와 정렬 기준을 조절하면 더 정밀하게 숨겨진 채널을 찾을 수 있습니다." },
];

const SORT_OPTIONS = [
  { label: "숨겨진 채널 점수순", value: "hidden" },
  { label: "조회수/구독자 비율순", value: "ratio" },
  { label: "구독자 적은순", value: "subs_asc" },
  { label: "총 조회수 많은순", value: "views_desc" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [sortBy, setSortBy] = useState("ratio");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxSubs, setMaxSubs] = useState("9999999999");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const doSearch = useCallback(async (q: string, pageToken?: string, append = false) => {
    if (!q.trim()) return;
    const isLoadMore = !!append;
    if (isLoadMore) setLoadingMore(true);
    else { setLoading(true); setResult(null); setError(null); }

    try {
      const params = new URLSearchParams({
        q: q.trim(),
        maxResults: "20",
        ...(pageToken ? { pageToken } : {}),
      });
      const res = await fetch(`/api/youtube/channels/search?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "검색 실패");

      let channels: Channel[] = data.channels || [];

      if (maxSubs) {
        channels = channels.filter(ch => ch.subscribers <= parseInt(maxSubs));
      }

      setResult(prev =>
        append && prev
          ? { ...data, channels: [...prev.channels, ...channels] }
          : { ...data, channels }
      );
      setNextPageToken(data.nextPageToken);
      setQuery(q);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [maxSubs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = selectedCategory ? `${inputVal} ${selectedCategory}`.trim() : inputVal.trim();
    doSearch(q || selectedCategory);
  };

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat.value);
    const q = cat.value
      ? (inputVal ? `${inputVal} ${cat.value}` : cat.value)
      : inputVal;
    if (q) doSearch(q);
  };

  const sortedChannels = (() => {
    if (!result) return [];
    const chs = [...result.channels];
    switch (sortBy) {
      case "ratio": return chs.sort((a, b) => b.viewsPerSubscriber - a.viewsPerSubscriber);
      case "subs_asc": return chs.sort((a, b) => a.subscribers - b.subscribers);
      case "views_desc": return chs.sort((a, b) => b.totalViews - a.totalViews);
      default: return chs.sort((a, b) => b.hiddenScore - a.hiddenScore);
    }
  })();

  const maxRatio = sortedChannels.reduce((m, c) => Math.max(m, c.viewsPerSubscriber), 0);

  return (
    <div className="relative min-h-screen overflow-x-hidden scrollbar-psychedelic">

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black mb-3 leading-tight">
            <span className="shimmer-text">TubeRadar</span>
            <br />
            <span style={{ color: "#111" }}>숨겨진 채널 발굴기</span>
          </h1>
          <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: "rgba(0,0,0,0.55)" }}>
            구독자는 적지만 조회수가 폭발적인<br />
            <span className="text-orange-500 font-semibold">다이아몬드 원석</span> 채널을 찾아드립니다
          </p>
        </header>

        {/* How To Modal */}
        {showHowTo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowHowTo(false)}>
            <div className="relative w-full max-w-lg rounded-3xl p-7"
              style={{ background: "#F5F0E8", border: "1px solid rgba(180,155,130,0.35)", boxShadow: "0 20px 50px rgba(100,70,50,0.15)" }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowHowTo(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ color: "#A08878", background: "rgba(160,120,90,0.1)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(160,120,90,0.18)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(160,120,90,0.1)")}>
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={18} style={{ color: "#C4845A" }} />
                <h2 className="font-black text-xl" style={{ color: "#4A3728" }}>사용 방법</h2>
              </div>
              <div className="space-y-5">
                {HOW_TO_STEPS.map(step => (
                  <div key={step.num} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                      style={{ background: `${step.color}20`, border: `1px solid ${step.color}55`, color: step.color }}>
                      {step.num}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-bold text-sm mb-1" style={{ color: "#4A3728" }}>{step.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#8C7B6E" }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowHowTo(false)}
                className="w-full mt-7 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #C4845A, #B07050)", color: "white", border: "none" }}>
                확인
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 rounded-2xl opacity-60"
              style={{ background: "linear-gradient(135deg, #FF6700, #FF0090, #6A0DAD)", filter: "blur(12px)", transform: "scale(1.02)" }} />
            <div className="relative flex items-center rounded-2xl overflow-hidden"
              style={{ background: "rgba(26,0,40,0.95)", border: "1px solid rgba(255,103,0,0.4)" }}>
              <Search size={20} className="ml-5 text-orange-400 flex-shrink-0" />
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="짧은 키워드로 검색 (예: 미드저니, 한국 요리, 클래식 기타)"
                className="flex-1 bg-transparent px-4 py-5 text-white placeholder-white/30 outline-none text-base"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-psychedelic m-2 px-6 py-3 rounded-xl font-bold text-sm flex-shrink-0 disabled:opacity-50"
              >
                {loading ? "검색 중..." : "발굴하기"}
              </button>
            </div>
          </div>
        </form>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                selectedCategory === cat.value
                  ? { background: "linear-gradient(135deg, #FF6700, #FF0090)", color: "white", boxShadow: "0 4px 14px rgba(255,103,0,0.3)" }
                  : { background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.15)", color: "#222" }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Search Examples */}
        <div className="mb-4">
          <p className="text-center text-xs mb-3 font-medium tracking-wider uppercase" style={{ color: "rgba(0,0,0,0.4)" }}>빠른 검색 예시</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_SEARCHES.map(qs => (
              <button
                key={qs.value}
                onClick={() => { setInputVal(qs.value); doSearch(qs.value); }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.6)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,103,0,0.5)"; (e.currentTarget as HTMLButtonElement).style.color = "#FF6700"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,0,0,0.6)"; }}
              >
                {qs.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "#333" }}
          >
            <Filter size={14} />
            고급 필터
            <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="card-psychedelic rounded-2xl p-6 max-w-2xl mx-auto mb-8 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-violet-400 mb-2 font-medium">최대 구독자 수</label>
              <select
                value={maxSubs}
                onChange={e => setMaxSubs(e.target.value)}
                className="w-full bg-white/5 border border-violet-800/50 rounded-xl px-3 py-2 text-white text-sm"
              >
                <option value="10000">1만 이하</option>
                <option value="50000">5만 이하</option>
                <option value="100000">10만 이하</option>
                <option value="500000">50만 이하</option>
                <option value="1000000">100만 이하</option>
                <option value="9999999999">제한 없음</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-violet-400 mb-2 font-medium">정렬 기준</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full bg-white/5 border border-violet-800/50 rounded-xl px-3 py-2 text-white text-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl text-center"
            style={{ background: "rgba(255,0,144,0.1)", border: "1px solid rgba(255,0,144,0.3)" }}>
            <p className="text-pink-400 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-psychedelic rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[0,1,2].map(j => <div key={j} className="h-16 bg-white/5 rounded-xl" />)}
                </div>
                <div className="h-4 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: "rgba(0,0,0,0.55)" }}>
                  <span className="font-bold text-lg" style={{ color: "#111" }}>{sortedChannels.length}</span>개 채널 발견
                  {query && <span className="ml-1" style={{ color: "#FF6700" }}>— "{query}"</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="rounded-xl px-3 py-2 text-xs" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.15)", color: "#222" }}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl w-fit"
              style={{ background: "rgba(255,103,0,0.08)", border: "1px solid rgba(255,103,0,0.2)" }}>
              <TrendingUp size={13} style={{ color: "#FF6700" }} />
              <span className="text-xs font-medium" style={{ color: "#FF6700" }}>
                조회수 / 구독자 비율이 높은 채널이 상위에 표시됩니다
              </span>
            </div>

            {sortedChannels.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto">
                <div className="text-5xl mb-5">🔍</div>
                <p className="text-lg font-bold mb-3" style={{ color: "rgba(0,0,0,0.6)" }}>채널을 찾지 못했습니다</p>
                <div className="rounded-2xl p-5 text-left space-y-3" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)" }}>
                  <p className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.75)" }}>💡 이렇게 검색해보세요:</p>
                  <ul className="space-y-2 text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">✓</span> 짧은 키워드로 검색 — <span className="text-orange-300">"미드저니"</span>, <span className="text-orange-300">"AI 그림"</span></li>
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">✗</span> 질문 문장은 검색 불가 — "차이점을 보여주세요"</li>
                    <li className="flex items-start gap-2"><span style={{color:"#CCFF00"}} className="mt-0.5">→</span> 영어 키워드도 잘 동작합니다 — <span style={{color:"#CCFF00"}}>"midjourney"</span></li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-5">
                  {["midjourney", "AI art", "stable diffusion", "미드저니"].map(kw => (
                    <button key={kw}
                      onClick={() => { setInputVal(kw); doSearch(kw); }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                      style={{ background: "rgba(255,103,0,0.15)", border: "1px solid rgba(255,103,0,0.4)", color: "#FF6700" }}>
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedChannels.map(channel => (
                  <ChannelCard key={channel.id} channel={channel} maxRatio={maxRatio} />
                ))}
              </div>
            )}

            {nextPageToken && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => doSearch(query, nextPageToken, true)}
                  disabled={loadingMore}
                  className="btn-primary-psychedelic px-8 py-4 rounded-2xl font-bold text-base disabled:opacity-50"
                >
                  {loadingMore ? "불러오는 중..." : "더 보기"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !result && !error && (
          <div className="py-16 text-center">
            <div className="w-24 h-24 rounded-full blob-morph flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, rgba(106,13,173,0.15), rgba(255,103,0,0.15))", border: "3px solid #FFD700", boxShadow: "0 0 12px rgba(255,215,0,0.5)" }}>
              <span className="text-4xl float-organic inline-block">💎</span>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "rgba(0,0,0,0.55)" }}>숨겨진 보석을 찾아보세요</h2>
            <p className="text-sm" style={{ color: "rgba(0,0,0,0.35)" }}>키워드 입력 또는 위 예시 버튼을 클릭해보세요</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center">
          <p className="text-xs" style={{ color: "rgba(0,0,0,0.3)" }}>
            YouTube Data API v3 기반 • 데이터는 실시간으로 갱신됩니다
          </p>
        </footer>
      </div>
    </div>
  );
}
