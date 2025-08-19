import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components";
import * as Icons from "@/assets/svg";
import { Link } from "react-router-dom";
// import { getQuizResult } from "@/apis/api"; // 나중에 API 함수를 import 합니다.

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
          { text: "(1) 가나다라마바사", percentage: 78 },
          { text: "(2) 가나다라마바사아자차카타파하", percentage: 44 },
          { text: "(3) 가나다라", percentage: 62 },
          { text: "(4) 가나다라", percentage: 70 },
        ],
      },
    ],
  },
  {
    sectionTitle: "가장 많이 틀린 문제",
    questions: [
      {
        id: 2,
        title: "Q2 어쩌고 저쩌고",
        options: [
          { text: "(1) 가나다라", percentage: 78 },
          { text: "(2) 가나다라", percentage: 44 },
        ],
      },
    ],
  },
];
const dummyScores = {
  allScores: [
    { name: "보보", score: 90 },
    { name: "미미", score: 85 },
  ],
  myScore: 70,
};
// ---------------------------------

export default function QuizResultStatisticsPage() {
  const { analysisId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [details, setDetails] = useState({});
  const [stats, setStats] = useState({});
  const [sections, setSections] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      /*
      // ▼▼▼ 2. 백엔드 연동 시 이 부분을 주석 해제하세요. ▼▼▼
      try {
        const result = await getQuizResult(analysisId);
        setDetails(result.details);
        setStats(result.stats);
        setSections(result.sections);
        setScores(result.scores);
      } catch (err) {
        console.error("퀴즈 결과 로딩 실패:", err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
      */

      // ▼▼▼ 3. 백엔드 연동 전까지 더미 데이터를 사용합니다. (연동 시 이 부분 삭제) ▼▼▼
      setTimeout(() => {
        setDetails(dummyDetails);
        setStats(dummyStats);
        setSections(dummyQuizSections);
        setScores(dummyScores);
        setLoading(false);
      }, 1000);
      // ▲▲▲ 여기까지 ▲▲▲
    };

    fetchData();
  }, [analysisId]);

  if (loading) {
    return <div>결과를 불러오는 중입니다...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-primary-dark text-white">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start gap-5">
        {/* 1. 왼쪽 패널 */}
        <aside className="w-[212px] mt-38 mr-41 flex-shrink-0 flex flex-col gap-4 pt-6">
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <h3 className="mb-4 font-bold text-h7">세부 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>참여자 관계</span>
                <span className="text-gray-300">{details.relationship} ˅</span>
              </div>
              <div className="flex justify-between">
                <span>대화 상황</span>
                <span className="text-[#f5f5f5]">{details.situation} ˅</span>
              </div>
              <div className="flex justify-between">
                <span>분석 기간</span>
                <span className="text-gray-300">{details.period} ˅</span>
              </div>
            </div>
            <button className="w-full mt-6 py-1.5 text-xs border border-secondary rounded text-secondary hover:bg-secondary hover:text-primary-dark">
              다시 분석
            </button>
          </div>
        </aside>

        {/* 2. 가운데 퀴즈 본문 */}
        <main className="w-[717px] flex-shrink-0 flex flex-col items-start mt-16 pt-6 max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3">Quiz</h1>
          <div className="group flex w-[180px] text-button border-1 border-primary-light rounded-[2px] ml-[536px] mt-3 px-[6px] py-1 transition-colors">
            <Link
              to={`/play/quiz/${analysisId}`} // 기능 추가
              className="flex-1 flex justify-center items-center text-[#595959] whitespace-nowrap pr-[2px]" // 디자인 유지
            >
              퀴즈 문제 구성
            </Link>
            <div className="border-r border-[#bfbfbf] h-4"></div>
            <a
              href="#"
              className="flex-1 flex justify-center items-center pl-[2px] text-primary-light whitespace-nowrap"
            >
              친구 점수 보기
            </a>
          </div>
          <div className="flex justify-between items-center w-full my-8">
            {/* 왼쪽: 친구 평균 점수 */}
            <div className="text-left">
              <p className="text-body1 text-gray-400">친구 평균 점수</p>
              <p className="text-h2 text-[#f5f5f5]">{stats.averageScore}점</p>
            </div>

            {/* 오른쪽: 문제 수/푼 사람 */}
            <div className="text-body1 w-25">
              {" "}
              {/* 부모에 고정 너비 부여 */}
              <p className="flex justify-between items-center">
                <span>문제 수</span>
                <span className="text-primary-light">
                  {stats.questionCount}
                </span>
              </p>
              <p className="flex justify-between items-center">
                <span>푼 사람</span>
                <span className="text-primary-light">
                  {stats.participantCount}
                </span>
              </p>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.sectionTitle} className="w-full mb-8">
              <div className="relative inline-block pt-3 mb-4">
                {/*선*/}
                <div
                  className="absolute top-0 h-px bg-secondary"
                  style={{
                    left: "-8px",
                    width: "calc(100% + 8px + 6px)",
                  }}
                ></div>
                {/*소제목*/}
                <h2 className="text-h6 text-primary-light">
                  {section.sectionTitle}
                </h2>
              </div>
              <div className="flex flex-col gap-6">
                {section.questions.map((q) => (
                  <div
                    key={q.id}
                    className="w-full p-5 border border-primary-light rounded-lg"
                  >
                    <h4 className="mb-4 font-bold text-h7">{q.title}</h4>
                    <div className="space-y-3 text-sm">
                      {q.options.map((opt) => (
                        <div key={opt.text} className="flex items-center gap-4">
                          <span className="w-2/5 truncate">{opt.text}</span>
                          <div className="w-3/5 flex items-center gap-2">
                            <div className="w-full bg-primary-light/20 rounded-full h-2.5">
                              <div
                                className="bg-primary-light h-2.5 rounded-full"
                                style={{ width: `${opt.percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-12 text-right text-gray-300">
                              {opt.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>

        {/* 3. 오른쪽 패널 */}
        <aside className="w-[212px] mt-38 ml-[147px] flex-shrink-0 flex flex-col gap-4 pt-6">
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <h3 className="mb-4 font-bold text-h7">전체 점수 보기</h3>
            <div className="space-y-2 text-sm">
              {scores.allScores?.map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="text-gray-300">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full p-4 border border-primary-light rounded-lg text-sm">
            <div className="flex justify-between">
              <span>내 점수 보기</span>
              <span className="text-primary-light">{scores.myScore}</span>
            </div>
          </div>
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <h3 className="mb-4 font-bold text-h7">URL 공유하기</h3>
            <button className="w-full py-1.5 mb-4 text-xs border border-secondary rounded text-secondary hover:bg-secondary hover:text-primary-dark">
              Copy
            </button>
            <div className="flex justify-around">
              <Icons.Person className="w-6 h-6 text-gray-400 cursor-pointer" />
              <Icons.Person className="w-6 h-6 text-gray-400 cursor-pointer" />
              <Icons.Person className="w-6 h-6 text-gray-400 cursor-pointer" />
              <Icons.Person className="w-6 h-6 text-gray-400 cursor-pointer" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
