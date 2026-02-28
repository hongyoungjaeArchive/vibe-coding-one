import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/animations";

export default function TermsPage() {
  return (
    <Layout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="container max-w-2xl py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">이용약관</h1>
        <p className="text-sm text-muted-foreground mb-8">최종 수정일: 2026년 2월 28일</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">제1조 (목적)</h2>
            <p>본 약관은 VIBB(이하 "서비스")가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 서비스의 권리·의무·책임사항 등을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">제2조 (정의)</h2>
            <p>① "서비스"란 VIBB가 제공하는 바이브코딩 결과물 공유 플랫폼을 의미합니다.</p>
            <p>② "이용자"란 본 약관에 따라 서비스를 이용하는 모든 회원을 말합니다.</p>
            <p>③ "콘텐츠"란 이용자가 서비스에 게시하는 모든 형태의 정보(텍스트, 이미지, 코드 등)를 말합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">제3조 (계정)</h2>
            <p>① 이용자는 정확한 정보를 제공하여 회원가입해야 합니다.</p>
            <p>② 계정 정보의 관리 책임은 이용자에게 있습니다.</p>
            <p>③ 타인의 계정을 부정하게 사용하는 행위는 금지됩니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">제4조 (콘텐츠 정책)</h2>
            <p>① 이용자가 게시한 콘텐츠의 저작권은 원칙적으로 이용자에게 있습니다.</p>
            <p>② 서비스는 콘텐츠를 서비스 운영 목적으로 사용할 수 있습니다.</p>
            <p>③ 타인의 지적재산권을 침해하는 콘텐츠는 게시할 수 없습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">제5조 (금지 행위)</h2>
            <p>이용자는 다음 행위를 해서는 안 됩니다:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>스팸, 광고성 콘텐츠 게시</li>
              <li>부적절하거나 유해한 콘텐츠 게시</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>타인의 개인정보를 수집하거나 유출하는 행위</li>
              <li>관련 법령을 위반하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">제6조 (면책)</h2>
            <p>① 서비스는 천재지변 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</p>
            <p>② 이용자 간의 분쟁에 대해 서비스는 개입할 의무가 없습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">제7조 (준거법)</h2>
            <p>본 약관은 대한민국 법률에 따라 해석되며, 관련 분쟁의 관할법원은 서울중앙지방법원으로 합니다.</p>
          </section>
        </div>
      </motion.div>
    </Layout>
  );
}
