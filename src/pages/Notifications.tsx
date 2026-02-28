import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Layout } from "@/components/layout/Layout";
import { EmptyState } from "@/components/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { pageVariants, notificationItem } from "@/lib/animations";
import { Bell, Heart, Bookmark, UserPlus, Loader2 } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
  actor: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*, actor:actor_id(username, display_name, avatar_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifications((data || []) as unknown as Notification[]);
      setLoading(false);
    };
    fetch();

    // Realtime subscription
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        // Refetch on new notification
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, navigate]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart className="h-4 w-4 text-coral" />;
      case "bookmark": return <Bookmark className="h-4 w-4 text-primary" />;
      case "follow": return <UserPlus className="h-4 w-4 text-primary" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMessage = (n: Notification) => {
    switch (n.type) {
      case "like": return "님이 게시물을 좋아합니다";
      case "bookmark": return "님이 게시물을 저장했습니다";
      case "follow": return "님이 팔로우하기 시작했습니다";
      default: return "";
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="container max-w-lg py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">알림</h1>
          {notifications.some((n) => !n.is_read) && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              모두 읽음
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon={<Bell className="h-16 w-16" />} title="아직 알림이 없어요" />
        ) : (
          <div className="space-y-1">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                custom={i}
                variants={notificationItem}
                initial="hidden"
                animate="visible"
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  n.is_read ? "hover:bg-muted" : "bg-primary/5 hover:bg-primary/10"
                }`}
                onClick={() => {
                  if (n.post_id) navigate(`/post/${n.post_id}`);
                  else if (n.actor) navigate(`/profile/${n.actor.username}`);
                }}
              >
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={n.actor?.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-xs">
                    {n.actor?.display_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <strong>{n.actor?.display_name}</strong>{getMessage(n)}
                  </p>
                </div>
                {getIcon(n.type)}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
