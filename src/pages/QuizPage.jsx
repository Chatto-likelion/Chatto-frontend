import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Header,
  FileUpload,
  ChatList,
  DetailForm,
  SmallServices,
} from "@/components";
import { getQuizData } from "@/apis/api";
import { Link } from "react-router-dom";

const dummyQuestions = [
  {
    id: 1,
    title: "Q1 어쩌고 저쩌고",
    options: [
      "(1) 가나다라",
      "(2) 가나다라마바사아자차카타파하가나다라",
      "(3) 가나다라",
      "(4) 가나다라",
    ],
  },
  {
    id: 2,
    title: "Q2 어쩌고 저쩌고",
    options: ["(1) 가나다라", "(2) 가나다라", "(3) 가나다라", "(4) 가나다라"],
  },
];
const dummyDetails = { relationship: "동아리 부원", situation: "일상대화" };

export default function QuizPage() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relation, setRelation] = useState("");
  const [situation, setSituation] = useState("");
  const [startPeriod, setStartPeriod] = useState(null);
  const [endPeriod, setEndPeriod] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setQuestions(dummyQuestions);
      setRelation(dummyDetails.relationship);
      setSituation(dummyDetails.situation);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-dark text-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-body1">퀴즈를 생성 중입니다...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-dark text-white">
        <Header />
        <div className="flex-1 flex items-center justify-center text-red-500">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start">
        {/* 왼쪽 패널 */}
        <aside className="w-[222px] flex-shrink-0 mt-53 mr-10 ">
          <div className="flex flex-col gap-5">
            <ChatList />
            <FileUpload />
          </div>
        </aside>

        {/* 가운데 + 오른쪽 패널 컨테이너 */}
        <main className="w-[1023px] flex flex-col justify-start max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3 text-[#f5f5f5] ml-30 pt-25">Quiz</h1>
          {/* 화면 전환 버튼 및 가운데 퀴즈 본문 */}
          <div className="group flex w-[180px] text-button border-1 border-primary-light rounded-[2px] ml-[588px] my-6 px-[6px] py-1 transition-colors">
            <a
              href="#"
              className="flex-1 flex justify-center items-center text-primary-light whitespace-nowrap pr-[2px] "
            >
              퀴즈 문제 구성
            </a>
            <div className="border-r border-[#bfbfbf] h-4"></div>
            <Link
              to={`/play/quiz/Result/Analysis/${analysisId}`}
              className="flex-1 flex justify-center items-center pl-[2px] text-[#595959] whitespace-nowrap"
            >
              친구 점수 보기
            </Link>
          </div>
          <div className="w-[600px] flex flex-col gap-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="w-[600px] ml-43 pt-3 pb-3 pl-4 pr-[14px] border border-primary-light rounded-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-h7">{q.title}</h2>
                  <span className="text-button text-[#d9d9d9]">수정/삭제</span>
                </div>
                <div className="space-y-1">
                  {q.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-body2 rounded-md"
                    >
                      <span>{option}</span>
                      <button className="text-body1 text-[#bfbfbf] hover:text-white">
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full flex justify-center mt-6">
            <button className="text-h4 text-primary-light hover:text-white">
              +
            </button>
          </div>
        </main>

        {/* 오른쪽 세부정보 패널 */}
        <aside className="w-53 flex flex-col mt-53 gap-4">
          <div className="w-full p-4 flex flex-col items-center border border-primary-light rounded-lg">
            <DetailForm
              isAnalysis={true}
              relation={relation}
              setRelation={setRelation}
              situation={situation}
              setSituation={setSituation}
              startPeriod={startPeriod}
              setStartPeriod={setStartPeriod}
              endPeriod={endPeriod}
              setEndPeriod={setEndPeriod}
            />
            <button className="mt-6 w-[79px] h-[34px] flex justify-center items-center text-button border border-secondary rounded-lg hover:bg-secondary hover:text-primary-dark">
              다시 분석
            </button>
          </div>
          <div className="w-full flex flex-row gap-2">
            <button className="w-[65px] h-7 text-button border border-secondary rounded-lg hover:bg-secondary hover:text-primary-dark">
              결과 공유
            </button>
            <button className="w-[65px] h-7 text-button border border-secondary rounded-lg hover:bg-secondary hover:text-primary-dark">
              퀴즈 생성
            </button>
            <button className="w-[65px] h-7 text-button border border-secondary rounded-lg hover:bg-secondary hover:text-primary-dark">
              결과 삭제
            </button>
          </div>
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <SmallServices />
          </div>
        </aside>
      </div>
    </div>
  );
}
