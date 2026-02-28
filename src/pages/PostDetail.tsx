import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToolBadge } from "@/components/ToolBadge";
import { EmptyState } from "@/components/EmptyState";
import { pageVariants, heartPop } from "@/lib/animations";
import { getVibeRank } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Heart, Bookmark, Share2, ArrowLeft, MoreHorizontal, Clock, Eye, Code2, Monitor, Smartphone,
  Loader2, Flag, Trash2, Edit, ExternalLink
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostData {
  id: string;
  title: string;
  content: string | null;
  tool_tags: string[];
  post_type: string;
  live_preview_html: string | null;
  preview_image_url: string | null;
  build_time_minutes: number | null;
  like_count: number;
  view_count: number;
  bookmark_count: number;
  created_at: string;
  user_id: string;
  users: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    vibe_score: number;
  };
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [previewMode, setPreviewMode] = useState<"image" | "preview" | "code">("image");
  const [previewWidth, setPreviewWidth] = useState("100%");

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("posts")
        .select("*, users(username, display_name, avatar_url, vibe_score)")
        .eq("id", id)
        .single();

      if (error || !data) {
        navigate("/404");
        return;
      }
      setPost(data as unknown as PostData);
      setLikeCount(data.like_count);

      // Increment view count
      await supabase.from("posts").update({ view_count: (data.view_count || 0) + 1 }).eq("id", id);

      // Check if liked/bookmarked
      if (user) {
        const [likeRes, bookmarkRes] = await Promise.all([
          supabase.from("likes").select("id").eq("user_id", user.id).eq("post_id", id).maybeSingle(),
          supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("post_id", id).maybeSingle(),
        ]);
        setLiked(!!likeRes.data);
        setBookmarked(!!bookmarkRes.data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id, user, navigate]);

  const handleLike = async () => {
    if (!user || !post) return;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: post.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleBookmark = async () => {
    if (!user || !post) return;
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("post_id", post.id);
      setBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, post_id: post.id });
      setBookmarked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "링크가 복사되었어요! 📋" });
  };

  const handleDelete = async () => {
    if (!post || !user) return;
    await supabase.from("posts").delete().eq("id", post.id);
    toast({ title: "게시물이 삭제되었어요" });
    navigate("/");
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

  if (!post) return null;

  const isOwner = user?.id === post.user_id;
  const postTypeBadge = {
    showcase: { label: "쇼케이스", className: "bg-primary/10 text-primary" },
    question: { label: "질문", className: "bg-blue-500/10 text-blue-500" },
    tip: { label: "팁", className: "bg-green-500/10 text-green-500" },
  }[post.post_type] || { label: "", className: "" };

  return (
    <Layout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="container max-w-3xl py-6">
        {/* Back + Menu */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> 뒤로
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/post/${post.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" /> 수정
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> 삭제
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" /> 신고하기
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/profile/${post.users.username}`)}>
            <AvatarImage src={post.users.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {post.users.display_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{post.users.display_name}</p>
            <p className="text-xs text-muted-foreground">@{post.users.username}</p>
          </div>
        </div>

        {/* Media */}
        {(post.preview_image_url || post.live_preview_html) && (
          <div className="mb-6">
            {post.live_preview_html && (
              <div className="flex gap-2 mb-3">
                {post.preview_image_url && (
                  <Button
                    variant={previewMode === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("image")}
                  >
                    이미지
                  </Button>
                )}
                <Button
                  variant={previewMode === "preview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("preview")}
                >
                  프리뷰
                </Button>
                <Button
                  variant={previewMode === "code" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("code")}
                >
                  코드
                </Button>
                {previewMode === "preview" && (
                  <div className="flex gap-1 ml-auto">
                    <Button variant="ghost" size="icon" onClick={() => setPreviewWidth("375px")}>
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setPreviewWidth("100%")}>
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {previewMode === "image" && post.preview_image_url && (
              <img
                src={post.preview_image_url}
                alt={post.title}
                className="w-full rounded-lg border border-border"
              />
            )}
            {previewMode === "preview" && post.live_preview_html && (
              <div className="border border-border rounded-lg overflow-hidden mx-auto transition-all" style={{ maxWidth: previewWidth }}>
                <iframe
                  srcDoc={post.live_preview_html}
                  className="w-full h-96"
                  sandbox="allow-scripts"
                  title="Live preview"
                />
              </div>
            )}
            {previewMode === "code" && post.live_preview_html && (
              <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono">
                <code>{post.live_preview_html}</code>
              </pre>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${postTypeBadge.className}`}>
              {postTypeBadge.label}
            </span>
            {post.build_time_minutes && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.build_time_minutes}분
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">{post.title}</h1>
          {post.tool_tags && post.tool_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tool_tags.map((tag) => (
                <ToolBadge key={tag} tool={tag} />
              ))}
            </div>
          )}
          {post.content && (
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 py-4 border-t border-border">
          <button onClick={handleLike} className="flex items-center gap-1.5">
            <motion.div animate={liked ? "liked" : "idle"} variants={heartPop}>
              <Heart className={`h-6 w-6 ${liked ? "fill-coral text-coral" : "text-muted-foreground"}`} />
            </motion.div>
            <span className="text-sm font-medium text-muted-foreground">{likeCount}</span>
          </button>

          <button onClick={handleBookmark} className="flex items-center gap-1.5">
            <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>

          <button onClick={handleShare} className="flex items-center gap-1.5 text-muted-foreground">
            <Share2 className="h-5 w-5" />
          </button>

          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {post.view_count}
          </span>
        </div>
      </motion.div>
    </Layout>
  );
}
