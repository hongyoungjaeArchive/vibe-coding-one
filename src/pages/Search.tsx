import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToolBadge } from "@/components/ToolBadge";
import { pageVariants } from "@/lib/animations";
import { Search as SearchIcon, Loader2 } from "lucide-react";

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    if (activeTab === "posts") {
      const { data } = await supabase
        .from("posts")
        .select("id, title, preview_image_url, tool_tags, like_count, users(display_name, username)")
        .ilike("title", `%${q}%`)
        .eq("is_published", true)
        .limit(20);
      setResults(data || []);
    } else {
      const { data } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, vibe_score")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(20);
      setResults(data || []);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="container max-w-lg py-6">
        {/* Search input */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="검색..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
          {(["posts", "users"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (query) handleSearch(query); }}
              className={`relative flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab === "posts" ? "게시물" : "유저"}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <EmptyState icon={<SearchIcon className="h-16 w-16" />} title="검색 결과가 없어요" />
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            {activeTab === "users"
              ? results.map((u) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/profile/${u.username}`)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {u.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </motion.div>
                ))
              : results.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/post/${p.id}`)}
                  >
                    {p.preview_image_url ? (
                      <img src={p.preview_image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg gradient-brand" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                      <div className="flex gap-1 mt-1">
                        {p.tool_tags?.slice(0, 2).map((t: string) => (
                          <ToolBadge key={t} tool={t} size="sm" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
