import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/constants";
import { getToolHex } from "@/lib/tools";
import { pageVariants } from "@/lib/animations";
import { Check, Sparkles, ArrowRight, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

const steps = ["welcome", "tools", "follow", "done"] as const;
type Step = typeof steps[number];

export default function OnboardingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const stepIndex = steps.indexOf(currentStep);

  const toggleTool = (key: string) => {
    setSelectedTools((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleToolsNext = async () => {
    if (selectedTools.length === 0) return;
    if (user) {
      await supabase
        .from("users")
        .update({ selected_tools: selectedTools })
        .eq("id", user.id);
    }
    setCurrentStep("follow");
  };

  const handleComplete = async () => {
    if (user) {
      await supabase
        .from("users")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
    }
    // Confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6C63FF", "#FF6B6B", "#FFD93D", "#FFFFFF"],
    });
    setTimeout(() => {
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 } });
    }, 300);
    setCurrentStep("done");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-12">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i <= stepIndex ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "welcome" && (
          <motion.div
            key="welcome"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center max-w-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-3xl font-black text-primary-foreground">V</span>
            </motion.div>
            <h1 className="text-3xl font-black text-foreground mb-2">VIBB에 오신 걸 환영해요!</h1>
            <p className="text-muted-foreground mb-8">
              바이브코딩 결과물을 공유하고
              <br />
              영감을 주고받는 곳
            </p>
            <Button size="lg" onClick={() => setCurrentStep("tools")} className="gap-2">
              시작하기 <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {currentStep === "tools" && (
          <motion.div
            key="tools"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center max-w-md w-full"
          >
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">주로 어떤 툴로 만드나요?</h2>
            <p className="text-sm text-muted-foreground mb-6">최소 1개 선택해주세요</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {TOOLS.map((tool) => {
                const selected = selectedTools.includes(tool.key);
                const hex = getToolHex(tool.key);
                return (
                  <button
                    key={tool.key}
                    onClick={() => toggleTool(tool.key)}
                    className="relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                    style={{
                      borderColor: selected ? hex : "hsl(var(--border))",
                      backgroundColor: selected ? `${hex}10` : "transparent",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${hex}20`, color: hex }}
                    >
                      {tool.name[0]}
                    </div>
                    <span className="font-medium text-foreground">{tool.name}</span>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="h-4 w-4" style={{ color: hex }} />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
            <Button
              size="lg"
              onClick={handleToolsNext}
              disabled={selectedTools.length === 0}
              className="gap-2"
            >
              다음 <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {currentStep === "follow" && (
          <motion.div
            key="follow"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center max-w-sm"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">추천 크리에이터</h2>
            <p className="text-muted-foreground mb-8">
              아직 등록된 유저가 없어요.
              <br />
              첫 번째 창작자가 되어보세요! 🎨
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleComplete}>
                건너뛰기
              </Button>
              <Button onClick={handleComplete} className="gap-2">
                다음 <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === "done" && (
          <motion.div
            key="done"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center max-w-sm"
          >
            <PartyPopper className="h-16 w-16 text-vibe-yellow mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              준비됐어요! 🎉
            </h2>
            <p className="text-muted-foreground mb-8">첫 작업물을 올려볼까요?</p>
            <div className="flex flex-col gap-3">
              <Button size="lg" onClick={() => navigate("/create")}>
                첫 게시물 올리기
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                피드 둘러보기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
