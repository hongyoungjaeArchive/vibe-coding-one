import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Layout } from "@/components/layout/Layout";
import { EmptyState } from "@/components/EmptyState";
import { ToolBadge } from "@/components/ToolBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { pageVariants, cardVariants } from "@/lib/animations";
import { getVibeRank } from "@/lib/constants";
import { Loader2, Image, Bookmark, Settings, Copy, CheckCircle2, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  vibe_score: number;
  referral_code: string;
  selected_tools: string[];
  created_at: string;
}

interface PostItem {
  id: string;
  title: string;
  preview_image_url: string | null;
  tool_tags: string[];
  like_count: number;
  post_type: string;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "bookmarks">("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const isOwner = user?.id === profileUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (!userData) {
        navigate("/404");
        return;
      }
      setProfileUser(userData as ProfileUser);

      // Fetch posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, title, preview_image_url, tool_tags, like_count, post_type")
        .eq("user_id", userData.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setPosts((postsData || []) as PostItem[]);

      // Fetch follow counts
      const [followerRes, followingRes] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact" }).eq("following_id", userData.id),
        supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", userData.id),
      ]);
      setFollowerCount(followerRes.count || 0);
      setFollowingCount(followingRes.count || 0);

      // Check if following
      if (user && user.id !== userData.id) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userData.id)
          .maybeSingle();
        setIsFollowing(!!followData);
      }

      setLoading(false);
    };
    fetchProfile();
  }, [username, user, navigate]);

  const handleFollow = async () => {
    if (!user || !profileUser) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profileUser.id);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profileUser.id });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  };

  const copyReferralCode = () => {
    if (!profileUser) return;
    navigator.clipboard.writeText(`${window.location.origin}/invite/${profileUser.referral_code}`);
    setCopied(true);
    toast({ title: "초대 링크가 복사되었어요!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!profileUser) return null;

  const rank = getVibeRank(profileUser.vibe_score);

  return (
    <Layout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="container max-w-2xl py-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileUser.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profileUser.display_name[0]}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <h1 className="text-xl font-bold text-foreground">{profileUser.display_name}</h1>
          <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
          {profileUser.bio && <p className="text-sm text-foreground mt-2 max-w-xs">{profileUser.bio}</p>}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <p className="font-bold text-foreground">{followerCount}</p>
              <p className="text-xs text-muted-foreground">팔로워</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{followingCount}</p>
              <p className="text-xs text-muted-foreground">팔로잉</p>
            </div>
            <div className="text-center">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-bold text-vibe-yellow"
              >
                {profileUser.vibe_score}
              </motion.p>
              <p className="text-xs text-muted-foreground">Vibe Score</p>
            </div>
          </div>

          {/* Rank badge */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="mt-3 px-3 py-1 rounded-full bg-vibe-yellow/10 text-sm font-medium"
            style={{ color: "hsl(var(--vibe-yellow))" }}
          >
            {rank.emoji} {rank.label}
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            {isOwner ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/settings/profile")}>
                <Settings className="h-4 w-4 mr-1" /> 프로필 수정
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
              >
                {isFollowing ? "팔로잉" : "팔로우"}
              </Button>
            )}
          </div>

          {/* Referral section (owner only) */}
          {isOwner && (
            <div className="mt-6 w-full max-w-xs p-4 rounded-xl border border-border bg-card">
              <p className="text-sm font-medium text-foreground mb-2">친구를 초대하면 Vibe Score +20점!</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 text-muted-foreground">
                  {profileUser.referral_code}
                </code>
                <Button variant="outline" size="sm" onClick={copyReferralCode}>
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
          {[
            { id: "posts" as const, label: "작업물", icon: Image },
            { id: "bookmarks" as const, label: "저장", icon: Bookmark },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md"
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profileTab"
                  className="absolute inset-0 bg-background rounded-md shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
              }`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "posts" && (
            <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {posts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {posts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/30 transition-all group"
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      {post.preview_image_url ? (
                        <img
                          src={post.preview_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full gradient-brand flex items-center justify-center p-3">
                          <p className="text-primary-foreground text-sm font-medium text-center line-clamp-3">
                            {post.title}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Layers className="h-16 w-16" />}
                  title="아직 작업물이 없어요"
                  action={
                    isOwner ? (
                      <Button onClick={() => navigate("/create")}>첫 작업물 올리기</Button>
                    ) : undefined
                  }
                />
              )}
            </motion.div>
          )}

          {activeTab === "bookmarks" && (
            <motion.div key="bookmarks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon={<Bookmark className="h-16 w-16" />}
                title="저장한 게시물이 없어요"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}
