import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { pageVariants } from "@/lib/animations";
import { Loader2, PartyPopper } from "lucide-react";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!code) return;
      const { data } = await supabase
        .from("users")
        .select("display_name")
        .eq("referral_code", code)
        .maybeSingle();
      if (data) {
        setInviterName(data.display_name);
        setValid(true);
      }
      setLoading(false);
    };
    check();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-black text-primary-foreground">V</span>
        </div>

        {valid ? (
          <>
            <PartyPopper className="h-10 w-10 text-vibe-yellow mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {inviterName}님이 VIBB에 초대했어요 🎉
            </h1>
            <p className="text-muted-foreground mb-6">
              바이브코딩 결과물을 공유하고 영감을 주고받는 곳
            </p>
            <Button size="lg" onClick={() => navigate(`/auth/signup?ref=${code}`)}>
              회원가입하기
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">유효하지 않은 초대 코드예요</h1>
            <p className="text-muted-foreground mb-6">초대 코드를 다시 확인해주세요</p>
            <Button variant="outline" onClick={() => navigate("/")}>홈으로</Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
