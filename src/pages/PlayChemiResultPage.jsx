// src/pages/PlayChemiDetailPage.jsx
import { Header, FileUpload, DetailForm, SmallServices } from "@/components";
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
  const messageCount = 1425;
  const peopleCount = 11;
  const period = "25/03/12 ~ 25/12/30";

  // 파이들 (대화 톤 / 주제 비율)
  const tonePie = {
    labels: ["긍정", "유머", "비판"],
    datasets: [
      {
        data: [63, 18, 7],
        backgroundColor: "#FFF6B5",
        borderColor: "#4C1D95", // 보라 배경에서 살짝 구분
        borderWidth: 1,
        offset: 20,
      },
    ],
  };
  const topicPie = {
    labels: ["업무/과제", "잡담/이벤트", "격려/감정", "미디어 공유"],
    datasets: [
      {
        data: [42, 26, 18, 14],
        backgroundColor: "#FFF6B5",
        borderColor: "#4C1D95",
        borderWidth: 1,
        offset: 20, // 전체 조각을 중심에서 20px 떨어뜨림
      },
    ],
  };

  const pieOpts = {
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  // TOP3 더미
  const top3 = [
    { pair: "수빈 & 민지", score: 96, note: "응답 속도·공감 높음" },
    { pair: "준서 & 은지", score: 91, note: "정보 공유 활발" },
    { pair: "민지 & 지윤", score: 88, note: "주제 확장 주도" },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-primary-dark text-white">
      <Header />

      <div className="flex-1 w-300 mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 좌측 패널 */}
        <aside className="gap-5 pt-6 w-61.5 mr-34.5 flex flex-col items-center">
          <FileUpload />
        </aside>

        {/* 가운데 본문 */}
        <main className="flex-1 overflow-y-auto max-h-[85vh] scrollbar-hide pt-10 w-163.25 pr-18 flex flex-col gap-8">
          {/* 1) 종합 케미 점수 + 요약 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <div className="flex justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-h6 mb-2">종합 케미 점수</h2>
                <div className="text-[56px] leading-[1] font-extrabold text-[#FFDDD5] mb-3">
                  {score}점
                </div>
                <p className="text-body2 leading-6 text-gray-100">
                  분석된 메시지 수: {messageCount.toLocaleString()}개<br />
                  참여자 수: {peopleCount}명<br />
                  분석 기간: {period}
                </p>
              </div>
              <div className="flex-1 text-sm leading-6">
                <p className="text-gray-200">
                  정서 동기화 + 주제 밀도 높음. 팀 내 상호작용이 비교적
                  안정적으로 유지되었습니다.
                </p>
                <p className="text-gray-300 mt-3">
                  ※ 케미 점수는 발화, 응답, 제안, 정보 공유, 문제 해결 등 5개
                  지표를 가중 종합하여 산정됩니다.
                </p>
              </div>
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
              <InteractionMatrix />
            </div>
          </section>

          {/* 3) 아래 큰 카드(여러 섹션 묶음) */}
          <section className="w-full p-6 border border-secondary rounded-lg flex flex-col gap-8">
            {/* TOP3 */}
            <div>
              <h3 className="text-h6 font-bold mb-3">케미 순위 TOP3</h3>
              <ul className="leading-7 text-gray-100">
                {top3.map((t) => (
                  <li key={t.pair}>
                    <span className="text-[#FFE27A] font-semibold">
                      {t.pair}
                    </span>{" "}
                    – {t.score}점
                    <span className="text-gray-300"> / {t.note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 대화 톤 */}
            <div>
              <h3 className="text-h6 font-bold mb-3">대화 톤</h3>
              <div className="w-40 h-40 mb-2">
                <Pie data={tonePie} options={pieOpts} />
              </div>
              <p className="text-sm mt-1">
                긍정적 표현:{" "}
                <span className="text-[#FF6B6B] font-bold">63%</span>
              </p>
            </div>

            {/* 응답 패턴 */}
            <div>
              <h3 className="text-h6 font-bold mb-2">응답 패턴</h3>
              <p className="text-sm leading-6">
                평균 응답 시간: 1시간 5분
                <br />
                즉각 응답 비율: 52%
                <br />
                읽씹 발생률: 8%
              </p>
            </div>

            {/* 대화 주제 비율 */}
            <div>
              <h3 className="text-h6 font-bold mb-3">대화 주제 비율</h3>
              <div className="w-40 h-40 mb-2">
                <Pie data={topicPie} options={pieOpts} />
              </div>
              <p className="text-sm text-gray-200 leading-6">
                업무/과제 42%, 잡담/이벤트 26%, 격려/감정 18%, 미디어 공유 14%
              </p>
            </div>

            {/* 서비스 분석 */}
            <div>
              <h3 className="text-h6 font-bold mb-2">챗토의 서비스 분석</h3>
              <p className="text-sm text-gray-200 leading-6">
                "이 방은 리액션 반응속도는 챔피언스 리그급,말 한마디 던지면 공감
                이모지 4연속이 돌아오는 곳이에요! 근데 문제는… 늘 나오는 사람만
                나온다는 거 😅"
              </p>
            </div>

            {/* 레벨업 가이드 */}
            <div>
              <h3 className="text-h6 font-bold mb-2">케미 레벨 업 가이드</h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 leading-6">
                <li>대화 주제 리프레시 및 요즘 핫한 주제 도입</li>
                <li>사진/짤 공유로 감정 교류 활성화</li>
                <li>참여 낮은 인원은 작은 역할부터 참여 유도</li>
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
