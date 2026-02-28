import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/animations";

export default function PrivacyPage() {
  return (
    <Layout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="container max-w-2xl py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">개인정보처리방침</h1>
        <p className="text-sm text-muted-foreground mb-8">최종 수정일: 2026년 2월 28일</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">1. 수집하는 개인정보 항목</h2>
            <p>VIBB는 회원가입 및 서비스 이용을 위해 아래와 같은 개인정보를 수집합니다:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>필수:</strong> 이메일 주소, 아이디(username), 표시 이름</li>
              <li><strong>선택:</strong> 프로필 사진, 자기소개, 웹사이트 URL</li>
              <li><strong>자동 수집:</strong> 접속 로그, 서비스 이용 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. 개인정보의 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 관리 및 본인 확인</li>
              <li>서비스 제공 및 운영</li>
              <li>서비스 개선 및 통계 분석</li>
              <li>부정 이용 방지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. 개인정보의 보유 및 이용 기간</h2>
            <p>이용자의 개인정보는 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. 개인정보의 제3자 제공</h2>
            <p>VIBB는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 법령에 의한 요청이 있는 경우에는 예외로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. 개인정보의 파기 절차 및 방법</h2>
            <p>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. 개인정보 보호책임자</h2>
            <p>이름: VIBB 운영팀</p>
            <p>이메일: privacy@vibb.kr</p>
          </section>
        </div>
      </motion.div>
    </Layout>
  );
}
