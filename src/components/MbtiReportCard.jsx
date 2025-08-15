// components/MbtiReportCard.jsx
// spec_personal 1개 객체를 받아 MBTI 리포트 카드 렌더링

export default function MbtiReportCard({ spec }) {
  const heading = (spec?.mbti || "").toUpperCase() || "MBTI";
  const intro = Array.isArray(spec?.intro) ? spec.intro : [];
  const features = Array.isArray(spec?.features) ? spec.features : [];
  const m = spec?.moments || {};

  // N/J는 { tag, lines } 형태도 허용
  const nBlock = Array.isArray(m.N) ? { tag: "N 모먼트", lines: m.N } : m.N;
  const jBlock = Array.isArray(m.J) ? { tag: "J 모먼트", lines: m.J } : m.J;

  return (
    <section className="w-full rounded-lg border border-[#FFF8DE] p-6 sm:p-7">
      {/* 상단 제목 */}
      <h3 className="text-2xl font-semibold tracking-tight mb-5">{heading}</h3>

      {/* 인트로 본문 */}
      <div className="leading-7 text-white/90 space-y-2">
        {intro.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {/* 대화 특징 */}
      <h4 className="mt-6 inline-block border-t-2 border-[#F6DE8D] pt-1 mb-4 text-xl font-semibold">
        대화 특징
      </h4>

      {/* 표 형태: 라벨 1열 + 본문 1열, 행마다 한 줄 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 pb-4">
        {features.map((f, i) => (
          <>
            {/* 좌측 라벨 */}
            <div className="text-white font-semibold">{f.name}</div>

            {/* 우측 내용 */}
            <div className="space-y-2 text-white/90 leading-7">
              {(f.right || []).map((r, idx) => (
                <p key={idx}>{r}</p>
              ))}
            </div>
          </>
        ))}
      </div>

      {/* 섹션: 모먼트 */}
      <SectionTitle className="mt-8 mb-4">{`${heading} 모먼트`}</SectionTitle>

      <div className="space-y-8">
        <MomentBlock
          title={heading}
          items={m[heading] || m.INFJ || []}
          align="left"
        />
        <MomentBlock title="I 모먼트" items={m.I || []} align="left" />
        <MomentBlock
          title={(nBlock && nBlock.tag) || "N 모먼트"}
          items={(nBlock && nBlock.lines) || []}
          align="right"
        />
        <MomentBlock title="F 모먼트" items={m.F || []} align="left" />
        <MomentBlock
          title={(jBlock && jBlock.tag) || "J 모먼트"}
          items={(jBlock && jBlock.lines) || []}
          align="right"
        />
      </div>
    </section>
  );
}

/* ===== 소형 컴포넌트 ===== */

function SectionTitle({ children, className = "" }) {
  // 글자 길이에 맞춘 상단 라인
  return (
    <div className={`inline-block ${className}`}>
      <div className="h-[2px] bg-[#F6DE8D] mb-2" />
      <h4 className="text-xl font-semibold">{children}</h4>
    </div>
  );
}

function FeatureRow({ name, right = [] }) {
  return (
    <div className="grid grid-cols-[minmax(120px,180px)_1fr] gap-6">
      <div className="text-white font-semibold">{name}</div>
      <div className="space-y-2 leading-7 text-white/90">
        {right.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
    </div>
  );
}

function MomentBlock({ title, items, align = "left" }) {
  if (!items || !items.length) return null;

  const isRight = align === "right";
  const containerCls = isRight ? "text-right" : "text-left";

  return (
    <div className={containerCls}>
      <p className="text-sm font-semibold text-white/90 mb-2">{title}</p>
      <div className="space-y-2 text-white/90 leading-7">
        {items.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
    </div>
  );
}
