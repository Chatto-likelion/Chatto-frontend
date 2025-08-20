import { useState, useEffect } from "react";
import { Header } from "@/components";
import {
  postCreditPurchase,
  getCreditPurchaseList,
  getCreditUsageList,
} from "@/apis/api";
import { useAuth } from "../contexts/AuthContext";
import { useKSTDateFormat } from "@/hooks/useKSTDateFormat"; // 훅 import

/* 탭 버튼 (pill) */
function Pill({ active, children, onClick }) {
  const activeCls =
    "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border-[var(--color-primary-light)]";
  const idleCls =
    "bg-transparent text-white border-[var(--color-primary-light)] hover:bg-white/5";
  return (
    <button
      onClick={onClick}
      className={`h-8 px-4 rounded-t-md border text-[13px] transition-colors ${
        active ? activeCls : idleCls
      }`}
    >
      {children}
    </button>
  );
}

/* 왼쪽: 상품 카드 */
function CreditProduct({ title, bonus, amount, payment }) {
  const handlePurchase = async () => {
    try {
      await postCreditPurchase({ amount: amount + bonus, payment });
      alert("크레딧 충전이 완료되었습니다.");
      window.location.reload();
    } catch (error) {
      alert(`크레딧 충전 실패: ${error.message}`);
    }
  };

  return (
    <div
      className="w-full rounded-[10px] border border-secondary-light px-6 py-5 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={handlePurchase}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col w-auto leading-none">
          <div className="text-[15px] text-white/90">{title}</div>
          {bonus && (
            <div className="mt-[6px] text-[12px] text-secondary">
              + {bonus}개 보너스
            </div>
          )}
        </div>
        <div className="text-[15px] bold">{payment}₩</div>
      </div>
    </div>
  );
}

/* 이용내역 테이블 — 상단 줄만 있는 형태 */
function UsageTable({ rows }) {
  const format = useKSTDateFormat(); // 훅 호출

  if (!rows || rows.length === 0) {
    return (
      <div className="mt-4 text-[13px] text-white/70 px-2 py-3 text-center">
        이용 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[13px] text-white/70">
            <th className="py-3 px-2 font-normal">분석 종류</th>
            <th className="py-3 px-2 font-normal">사용 일시</th>
            <th className="py-3 px-2 font-normal text-right">사용 크레딧</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.usage_id} className="text-[13px] text-white/90">
              <td className="py-2.5 px-2">
                {r.usage} ({r.purpose})
              </td>
              <td className="py-2.5 px-2">{format(r.created_at)}</td>
              <td className="py-2.5 px-2 text-right">-{r.amount}C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 구매내역 테이블 */
function PurchaseTable({ rows }) {
  const format = useKSTDateFormat(); // 훅 호출

  if (!rows || rows.length === 0) {
    return (
      <div className="mt-4 text-[13px] text-white/70 px-2 py-3 text-center">
        구매 내역이 없습니다.
      </div>
    );
  }
  return (
    <div className="mt-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[13px] text-white/70">
            <th className="py-3 px-2 font-normal">상품</th>
            <th className="py-3 px-2 font-normal">결제 금액</th>
            <th className="py-3 px-2 font-normal">구매 일시</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.purchase_id} className="text-[13px] text-white/90">
              <td className="py-2.5 px-2">{r.amount}C</td>
              <td className="py-2.5 px-2">{r.payment.toLocaleString()}₩</td>
              <td className="py-2.5 px-2">{format(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 크레딧 소개 컴포넌트 */
function CreditInfo() {
  return (
    <div className="mt-4 text-[14px] text-right text-white/80 px-2 py-3 leading-relaxed">
      크레딧은 챗토 서비스 내 유료 콘텐츠를 이용하는 데 필요한 가상 화폐입니다.
      <br />
      추가적인 분석 결과를 확인하거나, 퀴즈를 추가로 생성하는 데 이용될 수
      있으며,
      <br />
      크레딧이 부족할 경우 추가 충전이 필요합니다.
      <br />
      <br />
      보유한 크레딧은 화면 상단 우측에서 확인할 수 있고,
      <br />
      구매 내역과 이용 내역은 이곳에서 확인할 수 있습니다.
    </div>
  );
}

/* 상단 탭바 (라인 없음) + 우측 '크레딧이란?' */
function TabsBar({ active, setActive }) {
  return (
    <div className="relative border-b border-[var(--color-primary-light)]">
      <div className="flex items-center justify-between">
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
        <button
          onClick={() => setActive("info")}
          className="text-[13px] inline-flex h-8 items-center px-3 rounded-t-md border border-[var(--color-primary-light)] text-white hover:bg-white/5"
        >
          크레딧이란?
        </button>
      </div>
    </div>
  );
}

export default function CreditPage() {
  const { user } = useAuth();
  const [active, setActive] = useState("purchase");
  const [myCredits, setMyCredits] = useState(0);
  const [purchaseList, setPurchaseList] = useState([]);
  const [usageList, setUsageList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [purchaseData, usageData] = await Promise.all([
          getCreditPurchaseList(),
          getCreditUsageList(),
        ]);
        setPurchaseList(purchaseData);
        setUsageList(usageData);
        setMyCredits(user.credit);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        alert("데이터를 불러오는 데 실패했습니다. 다시 시도해 주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark text-white flex justify-center items-center">
        <div>데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark text-white">
      <Header />
      <div className="mx-auto w-full max-w-[1220px] px-6 pt-[200px] md:pt-[220px] pb-24">
        <div className="flex items-center justify-end">
          <div className="text-sm text-white/80">
            보유 크레딧 <span className="bold text-white">{myCredits}C</span>
          </div>
        </div>
        <div className="mt-8 grid gap-16 lg:grid-cols-[520px_minmax(0,1fr)]">
          <div className="w-full max-w-[520px]">
            <div className="flex flex-col gap-[26px]">
              <CreditProduct title="크레딧 10C" amount={10} payment={990} />
              <CreditProduct
                title="크레딧 50C"
                bonus={10}
                amount={50}
                payment={4900}
              />
              <CreditProduct
                title="크레딧 100C"
                bonus={30}
                amount={100}
                payment={9900}
              />
            </div>
          </div>
          <div className="w-full">
            <TabsBar active={active} setActive={setActive} />
            {active === "purchase" ? (
              <PurchaseTable rows={purchaseList} />
            ) : active === "usage" ? (
              <UsageTable rows={usageList} />
            ) : (
              <CreditInfo />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
