// components/MbtiReportCard.jsx
export default function MbtiReportCard({ spec }) {
  const S = spec ?? {};
  const mbti = (S.MBTI || "").toUpperCase();

  // MBTI 각 축의 선택 글자
  const L1 = mbti[0] === "E" ? "E" : "I"; // I/E
  const L2 = mbti[1] === "N" ? "N" : "S"; // S/N
  const L3 = mbti[2] === "T" ? "T" : "F"; // F/T
  const L4 = mbti[3] === "P" ? "P" : "J"; // J/P

  // 유틸: 문자열이 유효하면 아이템 객체로
  const mkItem = (text, kind) => {
    if (typeof text !== "string") return null;
    const t = text.trim();
    if (!t) return null;
    return { text: t, kind }; // kind: 'ex' | 'desc'
  };

  const momentBlocks = [
    {
      title: `${S.MBTI ?? ""} 모먼트`,
      items: [mkItem(S.moment_ex, "ex"), mkItem(S.moment_desc, "desc")],
      align: "left",
    },
    {
      title: `${L1} 모먼트`,
      items: [mkItem(S.momentIE_ex, "ex"), mkItem(S.momentIE_desc, "desc")],
      align: "left",
    },
    {
      title: `${L2} 모먼트`,
      items: [mkItem(S.momentSN_ex, "ex"), mkItem(S.momentSN_desc, "desc")],
      align: "right",
    },
    {
      title: `${L3} 모먼트`,
      items: [mkItem(S.momentFT_ex, "ex"), mkItem(S.momentFT_desc, "desc")],
      align: "left",
    },
    {
      title: `${L4} 모먼트`,
      items: [mkItem(S.momentJP_ex, "ex"), mkItem(S.momentJP_desc, "desc")],
      align: "right",
    },
  ].map((b) => ({ ...b, items: b.items.filter(Boolean) }));

  return (
    <section className="w-full text-body2 text-white rounded-lg border border-[#FFF8DE] p-6 sm:p-7">
      {/* 상단 제목 */}
      <h3 className="text-h4 font-semibold text-secondary-light tracking-tight mb-2">
        {S.MBTI}
      </h3>

      {/* 인트로 본문 */}
      <div className="leading-7 text-primary-light space-y-2 mb-3">
        {S.summary}
      </div>

      {/* 대화 특징 */}
      <h4 className="mt-6 inline-block border-t-2 border-[#F6DE8D] pt-1 mb-4 text-xl font-semibold">
        {S.position}
      </h4>

      {/* 표 형태 */}
      <div className="flex flex-col md:grid-cols-2 gap-x-10 gap-y-6 pb-4">
        <div className="leading-7 text-white/90 space-y-2">{S.desc}</div>
        <div className="leading-7 text-secondary-dark space-y-2">{S.style}</div>
      </div>

      {/* 섹션: 모먼트 */}
      <SectionTitle className="mt-8 mb-4">{`${
        S.MBTI ?? ""
      } 모먼트`}</SectionTitle>

      <div className="space-y-8">
        {momentBlocks
          .filter((b) => b.items.length > 0)
          .map((b, i) => (
            <MomentBlock
              key={`${b.title}-${i}`}
              title={b.title}
              items={b.items}
              align={b.align}
            />
          ))}
      </div>
    </section>
  );
}

/* ===== 소형 컴포넌트 ===== */

function SectionTitle({ children, className = "" }) {
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
  const containerCls = isRight ? "text-right pl-30" : "text-left pr-30";

  return (
    <div className={containerCls}>
      <p className="text-st1 font-semibold text-secondary-dark mb-2">{title}</p>
      <div className="space-y-2 leading-7">
        {items.map(({ text, kind }, i) => {
          const isEx = kind === "ex";
          return (
            <p key={i} className={isEx ? "text-secondary" : "text-white/90"}>
              {isEx ? `"${text}"` : text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
