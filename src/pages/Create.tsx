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
import { TOOLS } from "@/lib/constants";
import { getToolHex } from "@/lib/tools";
import { pageVariants } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { Check, ImagePlus, Loader2, Code2 } from "lucide-react";
import confetti from "canvas-confetti";

type PostType = "showcase" | "question" | "tip";

const postTypeConfig = {
  showcase: { label: "쇼케이스", emoji: "🟣", color: "hsl(var(--primary))" },
  question: { label: "질문", emoji: "🔵", color: "#3B82F6" },
  tip: { label: "팁", emoji: "🟢", color: "#22C55E" },
};

export default function CreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [postType, setPostType] = useState<PostType>("showcase");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [buildTime, setBuildTime] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/auth/login");
  }, [user, navigate]);

  const toggleTool = (key: string) => {
    setSelectedTools((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({ title: "이미지는 최대 5장까지 가능해요", variant: "destructive" });
      return;
    }
    const invalid = files.find(
      (f) => !ALLOWED_IMAGE_TYPES.includes(f.type) || f.size > MAX_IMAGE_SIZE
    );
    if (invalid) {
      toast({ title: "jpg/png/webp/gif만, 파일당 5MB 이하로 올려주세요", variant: "destructive" });
      return;
    }
    const newFiles = files.slice(0, 5 - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) return;
    setLoading(true);

    try {
      let previewImageUrl: string | null = null;

      // Upload first image if exists
      if (images.length > 0) {
        const file = images[0];
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("post-images")
            .getPublicUrl(path);
          previewImageUrl = urlData.publicUrl;
        }
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim() || null,
          tool_tags: selectedTools,
          post_type: postType,
          live_preview_html: htmlCode.trim() || null,
          preview_image_url: previewImageUrl,
          build_time_minutes: buildTime ? parseInt(buildTime) : null,
        })
        .select("id")
        .single();

      if (error) throw error;

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6C63FF", "#FF6B6B", "#FFD93D", "#FFFFFF"],
      });

      toast({ title: "게시물이 올라갔어요! 🎉" });
      navigate(`/post/${data.id}`);
    } catch (err: any) {
      toast({ title: err.message || "게시에 실패했습니다", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="container max-w-4xl py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">새 게시물</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Input */}
          <div className="space-y-5">
            {/* Post type tabs */}
            <div className="flex gap-2">
              {(Object.keys(postTypeConfig) as PostType[]).map((type) => {
                const cfg = postTypeConfig[type];
                const active = postType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setPostType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {cfg.emoji} {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Title */}
            <div>
              <Label>제목</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                placeholder="어떤 걸 만들었나요?"
              />
              <span className="text-xs text-muted-foreground">{title.length}/80</span>
            </div>

            {/* Content */}
            <div>
              <Label>설명</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 1500))}
                placeholder="어떻게 만들었는지 이야기해주세요"
                rows={5}
              />
              <span className="text-xs text-muted-foreground">{content.length}/1500</span>
            </div>

            {/* Tool tags */}
            <div>
              <Label>사용한 AI 툴</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TOOLS.map((tool) => {
                  const selected = selectedTools.includes(tool.key);
                  const hex = getToolHex(tool.key);
                  return (
                    <button
                      key={tool.key}
                      onClick={() => toggleTool(tool.key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all"
                      style={{
                        borderColor: selected ? hex : "hsl(var(--border))",
                        backgroundColor: selected ? `${hex}15` : "transparent",
                        color: selected ? hex : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {tool.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Build time */}
            <div>
              <Label>제작 시간 (분, 선택)</Label>
              <Input
                type="number"
                value={buildTime}
                onChange={(e) => setBuildTime(e.target.value)}
                placeholder="예: 30"
              />
            </div>

            {/* Images */}
            <div>
              <Label>이미지 (최대 5장)</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {imagePreviews.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-20 h-20 rounded-lg overflow-hidden"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
                {images.length < 5 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} multiple />
                  </label>
                )}
              </div>
            </div>

            {/* HTML Code */}
            <div>
              <Label className="flex items-center gap-2">
                <Code2 className="h-4 w-4" /> HTML 코드 (선택)
              </Label>
              <Textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder="라이브 프리뷰할 HTML 코드를 입력하세요"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Right - Preview */}
          <div className="space-y-4">
            <Label>미리보기</Label>
            {htmlCode.trim() ? (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <iframe
                  srcDoc={htmlCode}
                  className="w-full h-80"
                  sandbox="allow-scripts"
                  title="Preview"
                />
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-lg h-80 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  HTML 코드를 입력하면
                  <br />
                  여기서 미리볼 수 있어요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 border-t border-border pt-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !title.trim()}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            게시하기
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
}
