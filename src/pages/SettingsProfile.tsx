import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { pageVariants } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, CheckCircle2, XCircle } from "lucide-react";

export default function SettingsProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "same">("idle");

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    if (profile) {
      setDisplayName(profile.display_name);
      setUsername(profile.username);
      setBio(profile.bio || "");
      setWebsiteUrl(profile.website_url || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (!username || username === profile?.username) {
      setUsernameStatus(username === profile?.username ? "same" : "idle");
      return;
    }
    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      const { data } = await supabase.from("users").select("id").eq("username", username).maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    }, 500);
    return () => clearTimeout(timer);
  }, [username, profile?.username]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
  };

  const handleSave = async () => {
    if (!user) return;
    if (usernameStatus === "taken") return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          display_name: displayName,
          username,
          bio: bio || null,
          website_url: websiteUrl || null,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast({ title: "프로필이 저장되었어요! ✨" });
      navigate(`/profile/${username}`);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    displayName !== (profile?.display_name || "") ||
    username !== (profile?.username || "") ||
    bio !== (profile?.bio || "") ||
    websiteUrl !== (profile?.website_url || "") ||
    avatarUrl !== profile?.avatar_url;

  return (
    <Layout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="container max-w-md py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">프로필 수정</h1>

        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {displayName?.[0]?.toUpperCase() || "V"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-background" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div>
            <Label>표시 이름</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>

          <div>
            <Label>아이디</Label>
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {usernameStatus === "available" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {usernameStatus === "taken" && <XCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
          </div>

          <div>
            <Label>소개</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 100))}
              rows={2}
            />
            <span className="text-xs text-muted-foreground">{bio.length}/100</span>
          </div>

          <div>
            <Label>웹사이트</Label>
            <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://" />
          </div>

          <Button className="w-full" onClick={handleSave} disabled={loading || !hasChanges || usernameStatus === "taken"}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            저장
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
}
