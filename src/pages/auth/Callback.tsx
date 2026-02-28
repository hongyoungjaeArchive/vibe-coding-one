import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if profile exists, create if not
        const { data: existingProfile } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!existingProfile) {
          const meta = session.user.user_metadata;
          const emailPrefix = session.user.email?.split("@")[0] || "user";
          const username = (meta?.username || emailPrefix + "_" + Math.random().toString(36).slice(2, 6)).toLowerCase();
          const displayName = meta?.display_name || emailPrefix;

          await supabase.from("users").insert({
            id: session.user.id,
            username,
            display_name: displayName,
          });

          // Handle referral (vibe_score +20은 handle_referral_vibe_bonus 트리거에서 자동 처리)
          if (meta?.referral_code) {
            const { data: referrer } = await supabase
              .from("users")
              .select("id")
              .eq("referral_code", meta.referral_code)
              .maybeSingle();
            if (referrer) {
              await supabase
                .from("users")
                .update({ referred_by: referrer.id })
                .eq("id", session.user.id);
            }
          }

          navigate("/onboarding");
        } else {
          navigate("/");
        }
      } else {
        navigate("/auth/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
