import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components";
import * as Icons from "@/assets/svg";
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";
import CheckCircleIcon from "@/assets/svg/CheckCircle.svg?react";
import XCircleIcon from "@/assets/svg/XCircle.svg?react";

// --- 페이지에 표시할 더미 데이터 ---
const dummyDetails = {
  relationship: "동아리 부원",
  situation: "일상대화",
  period: "처음부터",
};
const dummyStats = {
  averageScore: 70,
  questionCount: 10,
  participantCount: 7,
};
const dummyQuizSections = [
  {
    sectionTitle: "대화 특징",
    questions: [
      {
        id: 1,
        title: "Q1 어쩌고 저쩌고",
        options: [
          "가나다라",
          "가나다라마바사아자차카타파하가나다라",
          "가나다라",
          "가나다라다다",
        ],
        correctOptionIndex: 1, // 정답 옵션의 인덱스 (0부터 시작)
        userSelectedOptionIndex: 1, // 사용자가 선택한 옵션의 인덱스
      },
    ],
  },
  {
    sectionTitle: "가장 많이 틀린 문제",
    questions: [
      {
        id: 2,
        title: "Q2 어쩌고 저쩌고",
        options: ["가나다라", "가나다라", "가나다라", "가나다라"],
        correctOptionIndex: 0,
        userSelectedOptionIndex: 2,
      },
    ],
  },
];
const dummyScores = {
  allScores: [
    { name: "보보", score: 90 },
    { name: "미미", score: 85 },
  ],
};

const dummyResultOwner = {
  name: "모모",
};

// ---------------------------------

export default function QuizResultPage() {
  const { analysisId } = useParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [stats, setStats] = useState({});
  const [sections, setSections] = useState([]);
  const [scores, setScores] = useState({ allScores: [] });
  const [owner, setOwner] = useState({});

  useEffect(() => {
    setTimeout(() => {
      setDetails(dummyDetails);
      setStats(dummyStats);
      setSections(dummyQuizSections);
      setScores(dummyScores);
      setOwner(dummyResultOwner);
      setLoading(false);
    }, 500);
  }, [analysisId]);

  if (loading) {
    return <div>결과를 불러오는 중입니다...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start gap-10">
        {/* 1. 왼쪽 패널 */}
        <aside className="w-[212px] flex-shrink-0 flex flex-col gap-4 pt-6 mt-48 mr-41">
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <h3 className="mb-4 font-bold text-st1">세부 정보</h3>
            <div className="space-y-2 text-body2">
              <div className="flex justify-between">
                <span>참여자 관계</span>
                <span className="text-[#f5f5f5]">{details.relationship} ˅</span>
              </div>
              <div className="flex justify-between">
                <span>대화 상황</span>
                <span className="text-[#f5f5f5]">{details.situation} ˅</span>
              </div>
              <div className="flex justify-between">
                <span>분석 기간</span>
                <span className="text-[#f5f5f5]0">{details.period} ˅</span>
              </div>
            </div>
            <button className="w-full mt-6 py-1.5 text-body2 border border-secondary rounded text-secondary hover:bg-secondary hover:text-primary-dark">
              다시 분석
            </button>
          </div>
        </aside>

        {/* 2. 가운데 퀴즈 본문 */}
        <main className="w-[650px] flex-shrink-0 flex flex-col items-start pt-6 mt-16 max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3">Quiz</h1>
          <h2 className="text-body1 text-primary-light mt-2">
            개인 점수 - {owner.name}
          </h2>
          <div className="flex justify-between items-center w-full my-8">
            {/* ... 점수 표시 코드는 그대로 ... */}
          </div>

          <div className="w-full flex flex-col gap-6">
            {sections
              .flatMap((section) => section.questions)
              .map((q) => (
                <div
                  key={q.id}
                  className="w-full p-5 border border-primary-light rounded-lg"
                >
                  <h4 className="font-bold text-h7 mb-4">{q.title}</h4>
                  <div className="space-y-0">
                    {q.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex justify-between items-center p-3 rounded-md ${
                          optIndex === q.correctOptionIndex
                            ? "bg-green-500/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                            <CheckBoxIcon className="absolute w-4 h-4" />
                            {optIndex === q.userSelectedOptionIndex && (
                              <CheckBoxCheckIcon className="absolute left-0 bottom-0 w-full h-full text-primary-light transform -translate-y-1" />
                            )}
                          </div>
                          <span className="text-body2">{opt}</span>
                        </div>
                        <div>
                          {optIndex === q.userSelectedOptionIndex &&
                            optIndex === q.correctOptionIndex && (
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            )}
                          {optIndex === q.userSelectedOptionIndex &&
                            optIndex !== q.correctOptionIndex && (
                              <XCircleIcon className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </main>

        {/* 3. 오른쪽 패널 */}
        <aside className="w-[212px] flex-shrink-0 flex flex-col gap-4 pt-6 mt-48 ml-[147px]">
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <div className="flex justify-center text-body2 mb-3">
              <span>전체 점수 보기</span>
            </div>

            {/* 구분선 추가 */}
            <hr className="border-t border-primary-light" />

            {/* 개인 점수 섹션 */}
            <div className="mt-4">
              <p className="font-bold text-body2 mb-2">개인 점수</p>
              <div className="space-y-2 text-body2">
                {scores.allScores?.map((s) => (
                  <div key={s.name} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="text-[#f5f5f5]">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full h-7 border border-primary-light rounded-lg">
            <div className="flex justify-center text-button pt-[5px]">
              <span>나도 풀어보기</span>
            </div>
          </div>
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <p className="text-overline mb-0">URL</p>
            <div className="flex items-center">
              <input
                type="text"
                readOnly
                value={`https://.../${analysisId}`}
                className="flex-1 bg-primary text-xs p-1 rounded-l text-gray-400"
              />
              <button className="bg-secondary text-primary-dark text-xs font-bold p-1 rounded-r">
                COPY
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
