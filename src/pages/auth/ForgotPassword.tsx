import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { pageVariants } from "@/lib/animations";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
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
          <h1 className="text-2xl font-bold text-foreground">비밀번호 재설정</h1>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              <strong>{email}</strong>으로 재설정 링크를 보냈어요.
            </p>
            <Button variant="outline" asChild>
              <Link to="/auth/login">로그인으로 돌아가기</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              재설정 링크 보내기
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
