// src/pages/PlayChemiDetailPage.jsx
import {
  Header,
  ChatList,
  FileUpload,
  DetailForm,
  SmallServices,
} from "@/components";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import * as Icons from "@/assets/svg/index.js";
import InteractionMatrix from "../components/InteractionMatrix.jsx";

import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

// 소제목 + 윗선
function SubTitle({ children, color = "var(--color-secondary)" }) {
  return (
    <h3 className="relative inline-block text-base md:text-lg font-semibold mb-4 leading-none">
      {children}
      {/* 글자 폭 100% = 선 길이 */}
      <span
        className="absolute left-0 -top-1 h-[2px] rounded"
        style={{ width: "100%", backgroundColor: color }}
      />
    </h3>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-lg p-5 sm:p-6 w-full border border-secondary">
      <h2 className="relative inline-block mb-6 text-base font-semibold tracking-wide leading-none">
        {title}
        <span
          className="absolute left-0 -top-1 h-[2px] rounded"
          style={{
            width: "100%",
            backgroundColor: "var(--color-secondary-light)",
          }}
        />
      </h2>
      {children}
    </section>
  );
}

export default function PlayChemiDetailPage() {
  const auth = useAuth();
  const user = auth?.user || { id: 1 };

  // 우측 폼 더미
  const [peopleNum, setPeopleNum] = useState("23명");
  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  // 상단 요약
  const score = 82;
  const messageCount = 1342;
  const peopleCount = 23;
  const period = "처음부터 마지막까지";

  // 파이차트 데이터
  const tonePie = {
    labels: ["긍정", "유머", "비판"],
    datasets: [
      {
        data: [63, 18, 7],
        // 모두 크림색(Secondary Light)로 통일
        backgroundColor: ["#FFF8DE", "#FFF8DE", "#FFF8DE"],
        // 보라 배경색과 동일하게 테두리를 주어 '파이 조각 틈' 효과
        borderColor:
          getComputedStyle(document.documentElement)
            .getPropertyValue("--color-primary-dark")
            .trim() || "#462c71",
        borderWidth: 8,
        offset: 0,
      },
    ],
  };
  const topicPie = {
    labels: ["업무/과제", "잡담/이벤트", "격려/감정", "미디어 공유"],
    datasets: [
      {
        data: [42, 26, 18, 14],
        backgroundColor: ["#FFF8DE", "#FFF8DE", "#FFF8DE", "#FFF8DE"],
        borderColor:
          getComputedStyle(document.documentElement)
            .getPropertyValue("--color-primary-dark")
            .trim() || "#462c71",
        borderWidth: 8,
        offset: 0,
      },
    ],
  };
  const pieOpts = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
  };

  // TOP3(상세 라인 포함)
  const chemTop3Items = [
    {
      rank: 1,
      pair: "수빈 & 민지",
      score: 96,
      lines: [
        "서로의 리액션을 독점하다시피 한 케미왕!",
        "이 정도면 이모티콘 1:1 전용 패스권 있어야 함",
      ],
    },
    {
      rank: 2,
      pair: "준서 & 은지",
      score: 91,
      lines: [
        "슬쩍 던진 밈에도 빵 터지는 조합.",
        "리액션 타율 0.932의 밈 조련사",
      ],
    },
    {
      rank: 3,
      pair: "민지 & 지윤",
      score: 88,
      lines: [
        "감정선 공명 + 공동 관심사 시너지",
        "카톡으로 공쟉 맞추는 커뮤니케이션 고수",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-primary-dark text-white">
      <Header />
      <div className="mx-auto w-[1352px] mt-[70px] flex gap-6 items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-52.5 w-53.5 flex flex-col items-center justify-center">
          <ChatList />
          <FileUpload />
        </div>

        {/* 가운데 본문 */}
        <main className="pt-24 pb-24 pl-20 pr-20 w-[722px] flex flex-col gap-15">
          {/* 1) 종합 케미 점수 + 요약 */}
          <section className="w-full">
            <h2 className="text-[18px] font-semibold tracking-tight mt-6">
              종합 케미 점수
            </h2>
            <div className="flex justify-between items-center">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[84px] font-extrabold leading-none"
                  style={{ color: "#FFE787" }}
                >
                  {score}
                </span>
                <span className="text-[40px] font-bold">점</span>
              </div>
              <div className="text-right text-[14px] leading-7 text-gray-100">
                <p>분석된 메시지 수: {messageCount.toLocaleString()}개</p>
                <p>참여자 수: {peopleCount}명</p>
                <p>분석 기간: {period}</p>
              </div>
            </div>

            <div className="mt-8 text-[14px] leading-7 text-gray-100">
              <p>
                정서 동기화 + 주제 몰입도 + 반응 속도까지, 이 방은 말 그대로
                케미 대잔치! 쉴 틈 없는 대화, 폭풍 리액션, 다채로운 주제로
                수다가 끊이지 않아요. 참여자 5명 모두 평균 이상 활약을 펼쳤고,
                감정 표현도 아주 적극적이었어요.
              </p>
              <p className="mt-2">
                한마디로 말해… 여기선 아무 말이나 해도 리액션이 옵니다. 지금
                초대하면 저도 들어갈래요.
              </p>
            </div>
          </section>

          {/* 상호작용 매트릭스 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h3 className="text-h6 font-bold mb-2">상호작용 매트릭스</h3>
            <p className="text-body2 mb-4">
              ※ 진한 선일수록 대화가 활발합니다! 분석 대상은 대화량 상위
              5명입니다.
            </p>
            <div className="rounded-md overflow-hidden" style={{ height: 420 }}>
              <InteractionMatrix
                people={["수빈", "민지", "지윤", "준서", "은지"]}
                links={[
                  { source: "수빈", target: "민지", value: 2 },
                  { source: "민지", target: "수빈", value: 5 },
                  { source: "수빈", target: "은지", value: 3 },
                  { source: "지윤", target: "준서", value: 2 },
                  { source: "준서", target: "지윤", value: 2 },
                  { source: "수빈", target: "지윤", value: 2 },
                  { source: "은지", target: "준서", value: 2 },
                  { source: "준서", target: "은지", value: 4 },
                  { source: "민지", target: "지윤", value: 4 },
                  { source: "지윤", target: "은지", value: 4 },
                ]}
              />
            </div>
          </section>

          {/* 3) 아래 ‘한 장’ 카드: TOP3 + 톤 + 응답패턴 + 주제 + 서비스분석 */}
          <section className="w-full p-6 border border-secondary rounded-lg flex flex-col gap-8">
            {/* TOP3 */}
            {/* TOP3 — 교체 코드 */}
            <div>
              <SubTitle>케미 순위 TOP3</SubTitle>
              <p className="text-xs text-white/60 -mt-1 mb-5">
                가장 활발하게 서로 연결된 멤버 조합
              </p>

              <div className="space-y-3">
                {chemTop3Items.map((it) => (
                  <div
                    key={it.rank}
                    className="grid gap-4"
                    style={{ gridTemplateColumns: "220px 1fr" }} // 왼쪽 고정폭, 오른쪽 가변
                  >
                    {/* 왼쪽: 한 줄 표기 */}
                    <div className="flex items-baseline whitespace-nowrap text-sm md:text-base">
                      <span className="text-white/70 mr-2">{`TOP${it.rank}`}</span>
                      <span className="font-semibold mr-2">{it.pair}</span>
                      <span className="text-white/60 mx-1">–</span>
                      <span className="text-white/90">{it.score}</span>
                      <span className="ml-1 text-white/80">점</span>
                    </div>

                    {/* 오른쪽: 설명 라인들 */}
                    <ul className="space-y-1">
                      {it.lines.map((line, idx) => (
                        <li
                          key={idx}
                          className="text-sm md:text-base leading-relaxed text-white/90"
                        >
                          <span className="mr-2 select-none">→</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 대화 톤 */}
            <div>
              <SubTitle>대화 톤</SubTitle>

              {/* 좌: 파이(크게), 우: 텍스트 */}
              <div
                className="grid gap-[20px]"
                style={{ gridTemplateColumns: "200px 1fr" }} // 스샷처럼 넉넉한 파이 크기
              >
                {/* 파이 */}
                <div className="w-[142.5px] h-[142.5px]">
                  <Pie data={tonePie} options={pieOpts} />
                </div>

                {/* 텍스트 블록 */}
                <div className="text-[14px] leading-[24px]">
                  {/* 상단 요약 라인 */}
                  <p className="text-white/90">
                    긍정적 표현: <span className="font-semibold">63%</span>
                    &nbsp;&nbsp; 농담/유머:{" "}
                    <span className="font-semibold">18%</span>&nbsp;&nbsp;
                    비판적 의견: <span className="font-semibold">7%</span>
                  </p>

                  {/* 예시 대화 */}
                  <p className="mt-2 font-semibold text-white/90">예시 대화</p>
                  <ul className="mt-1 space-y-[2px] text-white/90">
                    <li>긍정적 표현 → A: 야ㅋㅋ 이거 너 또 까먹었지</li>
                    <li>
                      농담/유머 → B: 인정ㅋㅋㅋ 이번엔 진짜 메모했다{" "}
                      <span role="img" aria-label="wink">
                        😉
                      </span>
                    </li>
                    <li>비판적 의견 → C: 이 방 진짜 텐션 최고네</li>
                  </ul>
                </div>
              </div>

              {/* 하단 분석 라인 */}
              <p
                className="mt-4 text-[14px]"
                style={{ color: "var(--color-secondary-light)" }}
              >
                분석: 농담과 자기인정형 유머가 관계 안정에 기여했습니다.
              </p>
            </div>

            {/* 응답 패턴 */}
            <div>
              <SubTitle>응답 패턴</SubTitle>
              <p className="text-sm leading-6">
                평균 응답 시간: 1시간 5분
                <br />
                즉각 응답 비율: 52%
                <br />
                읽씹 발생률: 8%
              </p>
              <p className="mt-2 text-[11px] md:text-xs text-white/70">
                분석: 식사·수업 등 활동이 끼면 반응이 느려집니다. 약간의 딜레이
                있는 날 경기도…?
              </p>
            </div>

            {/* ────────────────── 대화 주제 비율 ────────────────── */}
            <div>
              <SubTitle>대화 주제 비율</SubTitle>
              <div
                className="grid gap-[24px] items-start"
                style={{ gridTemplateColumns: "160px 1fr" }}
              >
                <div className="w-[140px] h-[140px] md:w-[160px] md:h-[160px]">
                  <Pie data={topicPie} options={pieOpts} />
                </div>

                {/* 텍스트 요약 (두 줄 구성) */}
                <div className="text-[14px] leading-[24px] text-white/90">
                  <p>
                    업무/과제: <span className="font-semibold">42%</span>
                    &nbsp;&nbsp; 잡담/이벤트:{" "}
                    <span className="font-semibold">26%</span>
                  </p>
                  <p className="mt-1">
                    격려/감정 표현: <span className="font-semibold">18%</span>
                    &nbsp;&nbsp; 미디어 공유:{" "}
                    <span className="font-semibold">14%</span>
                  </p>
                </div>
              </div>
            </div>

            {/* ────────────────── 챗토의 서비스 분석 ────────────────── */}
            <div>
              <SubTitle>챗토의 서비스 분석</SubTitle>
              <div className="text-[14px] leading-[26px] text-white/90">
                <p>
                  “준서는 반응의 남자입니다. 나타날 땐 언제고, 반응은 찰떡!”
                </p>
                <p>
                  “수빈과 민지는 대화방 내 실질적 커플입니다. 아니냐구요? 저만
                  그렇게 보였나요?”
                </p>
                <p>
                  “지윤은 대화의 윤활유. 혼자서도 잘 논다, 함께하면 더 잘 논다.”
                </p>
              </div>
            </div>

            {/* ────────────────── 챗토의 케미 레벨 업 가이드 ────────────────── */}
            <div>
              <SubTitle>챗토의 케미 레벨 업 가이드</SubTitle>

              {/* 요약 문구 */}
              <p className="text-[14px] leading-[24px] text-white/90">
                이 방은 리액션 반응속도는 챔피언스 리그급,
                <br />
                말 한마디 던지면 공감 이모지 4연속이 돌아오는 곳이에요!
                <br />
                근데 문제는… 늘 나오는 사람만 나온다는 거{" "}
                <span role="img" aria-label="wink">
                  😉
                </span>
              </p>

              {/* Tip 헤더 */}
              <p
                className="mt-5 text-[14px] font-semibold"
                style={{ color: "var(--color-secondary-light)" }}
              >
                Tip
              </p>

              {/* Tip 리스트 */}
              <ul className="mt-2 text-[14px] leading-[24px] text-white/90 space-y-[6px] list-disc pl-5">
                <li>
                  <span className="font-semibold">대화 주제 리프레시</span> —
                  “MBTI 얘기 그만 좀…” 말고 요즘 핫한 퀴즈, 밈 공유, 토론 주제
                  뿌려주세요.
                  <span className="text-white/70">
                    {" "}
                    (예: “물냉 vs 비냉”, “인생 첫 콘서트 뭐였어요?”)
                  </span>
                </li>
                <li>
                  <span className="font-semibold">
                    사진 1장으로 분위기 전환
                  </span>{" "}
                  — 식단, 강아지들, 웃긴 캡션들. 시작은 이미지 한 방!
                </li>
                <li>
                  <span className="font-semibold">1:1 대화 미션</span> —
                  리액션은 많은데 본문은 약한 사람?
                  <span className="text-white/70">
                    {" "}
                    → 개별 DM로 “그 얘기 너 어떻게 생각함?”
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </main>

        {/* 우측 패널 */}
        <aside className="w-47.25 mt-50 flex flex-col items-center gap-4">
          <DetailForm
            isAnalysis={true}
            peopleNum={peopleNum}
            setPeopleNum={setPeopleNum}
            relation={relation}
            setRelation={setRelation}
            situation={situation}
            setSituation={setSituation}
            startPeriod={startPeriod}
            setStartPeriod={setStartPeriod}
            endPeriod={endPeriod}
            setEndPeriod={setEndPeriod}
          />
          <div className="w-full h-42 border-2 border-primary-light rounded-lg p-3 pb-5 bg-primary-dark">
            <SmallServices />
          </div>
        </aside>
      </div>

      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
