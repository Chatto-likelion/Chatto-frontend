// src/pages/CreditPage.jsx
import React, { useState } from "react";
import { Header } from "@/components";

/* 탭 버튼 (pill) */
function Pill({ active, children, onClick }) {
  const activeCls =
    "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border-[var(--color-primary-light)]";
  const idleCls =
    "bg-transparent text-white border-[var(--color-primary-light)] hover:bg-white/5";
  return (
    <button
      onClick={onClick}
      className={`h-8 px-4 rounded-md border text-[13px] transition-colors ${
        active ? activeCls : idleCls
      }`}
    >
      {children}
    </button>
  );
}

/* 왼쪽: 상품 카드 */
function CreditProduct({ title, price, bonus }) {
  return (
    <div className="w-full rounded-[10px] border border-secondary-light px-6 py-5">
      <div className="flex items-center justify-between">
        {/* 제목 + 보너스 묶음 (hug) */}
        <div className="flex flex-col w-auto leading-none">
          <div className="text-[15px] text-white/90">{title}</div>
          {bonus && (
            <div className="mt-[6px] text-[12px] text-secondary">
              + {bonus} 보너스
            </div>
          )}
        </div>
        {/* 가격 */}
        <div className="text-[15px] bold">{price}</div>
      </div>
    </div>
  );
}

/* 이용내역 테이블 — 상단 줄만 있는 형태 */
function UsageTable({ rows }) {
  return (
    <div className="mt-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[13px] text-white/70">
            <th className="py-3 px-2 font-normal">분석 종류</th>
            <th className="py-3 px-2 font-normal">사용 날짜</th>
            <th className="py-3 px-2 font-normal text-right">사용 크레딧</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="text-[13px] text-white/90">
              <td className="py-2.5 px-2">{r.type}</td>
              <td className="py-2.5 px-2">{r.date}</td>
              <td className="py-2.5 px-2 text-right">{r.delta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 구매내역 자리 */
function PurchaseTable() {
  return (
    <div className="mt-4 text-[13px] text-white/70 px-2 py-3">
      [구매내역 API 연결 자리]
    </div>
  );
}

/* 상단 탭바 (라인 없음) + 우측 '크레딧이란?' */
function TabsBar({ active, setActive }) {
  return (
    <div className="relative border-b border-[var(--color-primary-light)]">
      <div className="flex items-center justify-between">
        {/* 좌측 탭들 */}
        <div className="flex items-center gap-2">
          <Pill
            active={active === "purchase"}
            onClick={() => setActive("purchase")}
          >
            구매내역
          </Pill>
          <Pill active={active === "usage"} onClick={() => setActive("usage")}>
            이용내역
          </Pill>
        </div>

        {/* 우측 도움말 pill */}
        <a
          href="#"
          className="inline-flex h-8 items-center px-3 rounded-md border border-[var(--color-primary-light)] text-white hover:bg-white/5"
        >
          크레딧이란?
        </a>
      </div>
    </div>
  );
}

export default function CreditPage() {
  const [active, setActive] = useState("usage"); // "usage" | "purchase"
  const myCredits = 30;

  const usageRows = [
    { type: "Play 케미 분석", date: "2025.01.08", delta: "-10C" },
    { type: "Play 케미 분석", date: "2025.01.08", delta: "-10C" },
    { type: "Play 케미 분석", date: "2025.01.08", delta: "-10C" },
  ];

  return (
    <div className="min-h-screen bg-primary-dark text-white">
      <Header />

      {/* 상단 여백 (너무 위에 붙는 문제 완화) */}
      <div className="mx-auto w-full max-w-[1220px] px-6 pt-[200px] md:pt-[220px] pb-24">
        {/* 보유 크레딧 */}
        <div className="flex items-center justify-end">
          <div className="text-sm text-white/80">
            보유 크레딧 <span className="bold text-white">{myCredits}C</span>
          </div>
        </div>

        {/* 좌/우 2열 */}
        <div className="mt-8 grid gap-16 lg:grid-cols-[520px_minmax(0,1fr)]">
          {/* 왼쪽 상품 리스트 */}
          <div className="w-full max-w-[520px]">
            <div className="flex flex-col gap-[26px]">
              <CreditProduct title="크레딧 10C" price="990W" />
              <CreditProduct title="크레딧 50C" price="4,900W" bonus="10개" />
              <CreditProduct title="크레딧 100C" price="9,900W" bonus="30개" />
            </div>
          </div>

          {/* 오른쪽: 탭바 + 상단 줄만 있는 테이블 */}
          <div className="w-full">
            <TabsBar active={active} setActive={setActive} />

            {/* 표: 카드 박스 제거, 상단 라인만 */}
            {active === "usage" ? (
              <UsageTable rows={usageRows} />
            ) : (
              <PurchaseTable />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
