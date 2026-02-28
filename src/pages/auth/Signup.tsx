import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { pageVariants } from "@/lib/animations";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";

export default function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [referralCode, setReferralCode] = useState(refCode);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // Check username availability
  useEffect(() => {
    if (!username || username.length < 2) {
      setUsernameStatus("idle");
      return;
    }
    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "비밀번호가 일치하지 않습니다", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "비밀번호는 8자 이상이어야 합니다", variant: "destructive" });
      return;
    }
    if (!agreedTerms) {
      toast({ title: "이용약관에 동의해주세요", variant: "destructive" });
      return;
    }
    if (usernameStatus === "taken") {
      toast({ title: "이미 사용 중인 아이디입니다", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1) Supabase 계정 생성 (이메일 인증 없이 바로 사용하려면 Supabase Auth 설정에서 이메일 확인 비활성화 필요)
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, display_name: displayName, referral_code: referralCode },
        },
      });

      if (error) throw error;

      // 2) 방금 가입한 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "회원가입은 되었지만 자동 로그인에 실패했습니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }

      // 3) 프로필이 없으면 users 테이블에 생성
      const { data: existingProfile, error: profileError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!existingProfile) {
        const emailPrefix = user.email?.split("@")[0] || "user";
        const finalUsername = username || (emailPrefix + "_" + Math.random().toString(36).slice(2, 6)).toLowerCase();
        const finalDisplayName = displayName || emailPrefix;

        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          username: finalUsername,
          display_name: finalDisplayName,
        });

        if (insertError) throw insertError;

        // 4) 추천인 코드가 있다면 referred_by 설정 (보너스 점수는 DB 트리거에서 처리)
        const trimmedRef = referralCode.trim();
        if (trimmedRef) {
          const { data: referrer, error: referrerError } = await supabase
            .from("users")
            .select("id")
            .eq("referral_code", trimmedRef)
            .maybeSingle();

          if (referrerError) {
            console.error("추천인 조회 실패:", referrerError);
          } else if (referrer) {
            const { error: updateError } = await supabase
              .from("users")
              .update({ referred_by: referrer.id })
              .eq("id", user.id);

            if (updateError) {
              console.error("추천인 설정 실패:", updateError);
            }
          }
        }

        navigate("/onboarding");
      } else {
        // 이미 프로필이 있으면 홈으로
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: err.message || "회원가입에 실패했습니다", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/">
            <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-black text-primary-foreground">V</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">VIBB에 가입하기</h1>
          <p className="text-sm text-muted-foreground mt-1">바이브코딩 결과물을 공유해보세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="username">아이디</Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="영소문자, 숫자, 밑줄"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {usernameStatus === "available" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {usernameStatus === "taken" && <XCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="displayName">표시 이름</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="password">비밀번호 (8자 이상)</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="referral">초대 코드 (선택)</Label>
            <Input id="referral" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreedTerms}
              onCheckedChange={(v) => setAgreedTerms(v as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
              <Link to="/terms" className="text-primary hover:underline">이용약관</Link> 및{" "}
              <Link to="/privacy" className="text-primary hover:underline">개인정보처리방침</Link>에 동의합니다
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            회원가입
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          이미 계정이 있나요?{" "}
          <Link to="/auth/login" className="text-primary hover:underline font-medium">
            로그인
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
