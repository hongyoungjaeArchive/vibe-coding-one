import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Layers, Users, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { pageVariants } from "@/lib/animations";

function HeroBanner() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="gradient-hero border-b border-border"
    >
      <div className="container py-16 md:py-24 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
        >
          <Sparkles className="h-4 w-4" />
          한국 최초 바이브코딩 커뮤니티
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight">
          바이브코딩으로 만든 것들을
          <br />
          <span className="text-gradient-brand">공유하는 곳</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto mb-8">
          AI 툴로 만든 앱, 웹, 툴을 올리고
          <br />
          영감을 주고받아요
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/auth/signup")} className="gap-2">
            지금 시작하기 <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth/login")}>
            로그인
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"trending" | "following">("trending");

  const tabs = [
    { id: "trending" as const, label: "트렌딩", icon: TrendingUp },
    { id: "following" as const, label: "팔로잉", icon: Users },
  ];

  return (
    <Layout>
      {!user && <HeroBanner />}

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container py-6"
      >
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 max-w-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2 px-4 text-sm font-medium rounded-md transition-colors"
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
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

        {/* Feed content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Empty state */}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "trending" ? (
            <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon={<Layers className="h-16 w-16" />}
                title="아직 게시물이 없어요"
                description="첫 번째 작업물을 올려보세요!"
                action={
                  <Button onClick={() => user ? navigate("/create") : navigate("/auth/signup")}>
                    첫 작업물 올리기
                  </Button>
                }
              />
            </motion.div>
          ) : (
            <motion.div key="following" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon={<Users className="h-16 w-16" />}
                title="팔로우한 사람이 없어요"
                description="관심 있는 크리에이터를 팔로우해보세요"
                action={
                  <Button variant="outline" onClick={() => setActiveTab("trending")}>
                    트렌딩 둘러보기
                  </Button>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}
