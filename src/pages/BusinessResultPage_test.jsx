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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function BusinessAnalysisPage() {
  const auth = useAuth();
  const user = auth?.user || { id: 1 };

  const [peopleNum, setPeopleNum] = useState("23명");
  const [relation, setRelation] = useState("프로젝트 팀원");
  const [situation, setSituation] = useState("업무 대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  const [activeTab, setActiveTab] = useState(0); // 0: 항목별, 1: 개인별, 2: 기간별

  // 더미 데이터
  const barData = [
    { name: "A", value: 50 },
    { name: "B", value: 40 },
    { name: "C", value: 35 },
    { name: "D", value: 28 },
    { name: "E", value: 20 },
  ];

  const lineData = [
    { date: "08.10", A: 10, B: 8, C: 6, D: 5, E: 4 },
    { date: "08.11", A: 12, B: 9, C: 7, D: 6, E: 4 },
    { date: "08.12", A: 15, B: 11, C: 8, D: 7, E: 6 },
    { date: "08.13", A: 18, B: 14, C: 10, D: 9, E: 7 },
    { date: "08.14", A: 16, B: 13, C: 9, D: 8, E: 6 },
    { date: "08.15", A: 14, B: 12, C: 8, D: 7, E: 5 },
    { date: "08.16", A: 15, B: 12, C: 9, D: 7, E: 6 },
  ];

  const personalProfiles = [
    {
      name: "A(김하늘)",
      score: 89,
      traits: [
        "매우 적극적",
        "정보 공유",
        "문제 해결",
        "주도적 제안",
        "응답 속도",
      ],
      comment:
        "본인 A는 주도적 역할을 수행하며 핵심 정보와 아이디어를 자주 제공합니다.",
      status: "진행중/활성",
    },
    {
      name: "B(이민수)",
      score: 85,
      traits: [
        "매우 적극적",
        "정보 공유",
        "문제 해결",
        "주도적 제안",
        "응답 속도",
      ],
      comment:
        "본인 B는 주도적 역할을 수행하며 핵심 정보와 아이디어를 자주 제공합니다.",
      status: "진행중/활성",
    },
  ];

  const chartTitles = [
    "종합 참여 점수",
    "정보 공유",
    "문제 해결 참여",
    "주도적 제안",
    "응답 속도",
  ];

  return (
    <div className="min-h-screen bg-white text-primary-dark">
      <Header />
      <div className="mx-auto w-[1352px] mt-[70px] flex gap-6 items-start">
        {/* 왼쪽 */}
        <div className="gap-5 mt-[210px] w-[214px] flex flex-col items-center justify-center">
          <ChatList />
          <FileUpload />
        </div>

        {/* 중앙 */}
        <main className="pt-24 pb-24 w-[722px] flex flex-col gap-6">
          {/* 상단 분석 정보 */}
          <section className="w-full">
            <h2 className="text-xl font-bold text-secondary-dark mb-4">
              "멋사 잡담방" 참여도 분석
            </h2>
            <p>분석 기간: 25/03/12~25/12/30</p>
            <p>참여자: 11명</p>
            <p>대화량: 1,425건</p>
            <p>방문 응답 속도: 42분</p>
            <p className="mt-2 text-sm text-gray-500">
              ※ 본 분석 자료는 발화, 응답, 제안, 정보 공유, 문제 해결 등 다섯
              지표를 종합하여 산정되었습니다.
            </p>
          </section>

          {/* 탭 영역 */}
          <div className="flex border-b border-secondary-dark">
            {["항목별 보기", "개인별 보기", "기간별 보기"].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                style={{ height: "39px", minWidth: "128px" }}
                className={`px-4 text-sm font-medium rounded-t-md border border-secondary-dark 
                  ${
                    activeTab === idx
                      ? "bg-secondary-dark text-white border-b-white"
                      : "bg-white text-secondary-dark"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 탭별 콘텐츠 */}
          {activeTab === 0 &&
            chartTitles.map((title) => (
              <ChartSection
                key={title}
                title={title}
                data={barData}
                type="bar"
              />
            ))}

          {activeTab === 1 && <PersonalView profiles={personalProfiles} />}

          {activeTab === 2 &&
            chartTitles.map((title) => (
              <ChartSection
                key={title}
                title={title}
                data={lineData}
                type="line"
              />
            ))}

          {/* AI 종합 인사이트 */}
          <section className="w-full p-6 border border-secondary-dark rounded-lg bg-white">
            <h3 className="text-base font-bold mb-2 text-secondary-dark">
              AI 종합 인사이트
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              본 팀은 전반적으로 활발한 참여를 유지하면서도, 일부 참여자(A,B)가
              정보 흐름과 문제 해결의 중심을 담당하는 것으로 나타났습니다. 다만
              일부 구성원(C,D)의 참여 빈도와 주도성은 개선 여지가 있습니다.
            </p>
          </section>

          {/* 추천 액션 */}
          <section className="w-full p-6 border border-secondary-dark rounded-lg bg-white">
            <h3 className="text-base font-bold mb-2 text-secondary-dark">
              추천 액션
            </h3>
            <ul className="list-disc pl-6 text-sm text-gray-700 leading-relaxed">
              <li>가이드 역할 분명화</li>
              <li>주도적 제안과 참여자 지명 역할 분산</li>
              <li>주간 회의에서 아이디어 공유 기회 확대</li>
              <li>응답 속도 개선</li>
              <li>참여율 낮은 인원에게 소규모 업무부터 배정</li>
            </ul>
          </section>
        </main>

        {/* 우측 */}
        <div className="w-[214px] mt-52.5 flex flex-col items-center justify-start gap-4">
          <div className="w-full py-4 px-1 border border-secondary-light rounded-lg">
            <DetailForm
              isAnalysis
              relation={relation}
              setRelation={setRelation}
              situation={situation}
              setSituation={setSituation}
              startPeriod={startPeriod}
              setStartPeriod={setStartPeriod}
              endPeriod={endPeriod}
              setEndPeriod={setEndPeriod}
            />
            <button className="mt-6 w-19.75 h-8.5 hover:bg-secondary hover:text-primary-dark px-3 py-2 text-button border border-secondary rounded-lg">
              다시 분석
            </button>
          </div>
          <div className="w-full h-[170px] p-3.75 border border-secondary-light rounded-lg text-primary-light">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}

function ChartSection({ title, data, type }) {
  return (
    <section
      style={{
        width: "560.18px",
        height: "267px",
        backgroundColor: "#FFFFFF",
        borderTop: "2px solid var(--color-secondary-dark)",
        padding: "16px",
      }}
      className="rounded-lg"
    >
      <h3 className="text-sm font-medium mb-2 text-black">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        {type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#6A0DAD" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="A" stroke="#6A0DAD" />
            <Line type="monotone" dataKey="B" stroke="#8B5CF6" />
            <Line type="monotone" dataKey="C" stroke="#A78BFA" />
            <Line type="monotone" dataKey="D" stroke="#C4B5FD" />
            <Line type="monotone" dataKey="E" stroke="#DDD6FE" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </section>
  );
}

function PersonalView({ profiles }) {
  return (
    <div className="flex flex-col gap-6">
      {profiles.map((p) => (
        <div
          key={p.name}
          className="border border-secondary-dark rounded-lg p-4 bg-white text-black"
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">
              {p.name} 참여 점수: {p.score}점
            </h4>
            <span className="text-sm text-gray-500">{p.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            {p.traits.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
          <p className="mt-2 text-secondary-dark text-sm">{p.comment}</p>
        </div>
      ))}
    </div>
  );
}
