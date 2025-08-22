import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components";
import * as Icons from "@/assets/svg";
import { useQuizResultAnalysis } from "@/hooks/useQuizResultAnalysis";

export default function QuizResultAnalysisPage() {
  // 컴포넌트 이름 변경
  const { analysisId } = useParams();
  const { details, stats, sections, scores, loading, error } =
    useQuizResultAnalysis(analysisId);

  if (loading) {
    return <div>결과를 불러오는 중입니다...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-primary-dark text-gray-2">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start gap-5">
        {/* 왼쪽 패널 */}
        <aside className="w-[212px] mt-38 mr-41 flex-shrink-0 flex flex-col gap-4 pt-6">
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <h3 className="mb-4 font-bold text-h7">세부 정보</h3>
            <div className="space-y-2 text-body1">
              <div className="flex justify-between">
                <span>참여자 관계</span>
                <span className="text-gray-4">{details.relationship} ˅</span>
              </div>
              <div className="flex justify-between">
                <span>대화 상황</span>
                <span className="text-[#f5f5f5]">{details.situation} ˅</span>
              </div>
              <div className="flex justify-between">
                <span>분석 기간</span>
                <span className="text-gray-4">{details.period} ˅</span>
              </div>
            </div>
            <button className="w-full mt-6 py-1.5 text-body2 border border-secondary rounded text-secondary hover:bg-secondary hover:text-primary-dark">
              다시 분석
            </button>
          </div>
        </aside>

        {/* 가운데 퀴즈 본문 */}
        <main className="w-[717px] flex-shrink-0 flex flex-col items-start mt-16 pt-6 max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3">Quiz</h1>
          <div className="group flex w-[180px] text-button border-1 border-primary-light rounded-[2px] ml-[536px] mt-3 px-[6px] py-1 transition-colors">
            <Link
              to={`/play/quiz/${analysisId}`}
              className="flex-1 flex justify-center items-center text-[#595959] whitespace-nowrap pr-[2px]"
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
            <div className="text-left">
              <p className="text-body1 text-gray-4">친구 평균 점수</p>
              <p className="text-h2 text-[#f5f5f5]">{stats.averageScore}점</p>
            </div>
            <div className="text-body1 w-25">
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
                <div
                  className="absolute top-0 h-px bg-secondary"
                  style={{ left: "-8px", width: "calc(100% + 8px + 6px)" }}
                ></div>
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
                    <div className="space-y-3 text-body2">
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
                            <span className="w-12 text-right text-gray-4">
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

        {/* 오른쪽 패널 */}
        <aside className="w-[212px] mt-38 ml-[147px] flex-shrink-0 flex flex-col gap-4 pt-6">
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <h3 className="mb-4 text-body1">개인 점수 보기</h3>
            <div className="space-y-2 text-body2">
              {scores.allScores?.map((s) => (
                <div key={s.name} className="flex justify-between">
                  {s.name === "모모" ? (
                    <Link
                      to="/play/quiz/result/123"
                      className="hover:text-[#595959] transition-colors"
                    >
                      {s.name}
                    </Link>
                  ) : (
                    <span>{s.name}</span>
                  )}
                  <span className="text-gray-4">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <h3 className="mb-4 font-bold text-h7">URL 공유하기</h3>
            <button className="w-full py-1.5 mb-4 text-body2 border border-secondary rounded text-secondary hover:bg-secondary hover:text-primary-dark">
              Copy
            </button>
            <div className="flex justify-around">
              <Icons.Person className="w-6 h-6 text-gray-4 cursor-pointer" />
              <Icons.Person className="w-6 h-6 text-gray-4 cursor-pointer" />
              <Icons.Person className="w-6 h-6 text-gray-4 cursor-pointer" />
              <Icons.Person className="w-6 h-6 text-gray-4 cursor-pointer" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { Header } from "@/components";
// import * as Icons from "@/assets/svg";

// // --- 페이지에 표시할 더미 데이터 ---
// const dummyDetails = {
//   relationship: "동아리 부원",
//   situation: "일상대화",
//   period: "처음부터",
// };
// const dummyStats = {
//   averageScore: 70,
//   questionCount: 10,
//   participantCount: 7,
// };
// const dummyAllQuestions = [
//   {
//     id: 1,
//     title: "Q1 (가장 많이 맞춘 문제)",
//     options: [
//       { text: "정답 선택지 (95%)", percentage: 95 },
//       { text: "오답 선택지 1", percentage: 3 },
//       { text: "오답 선택지 2", percentage: 1 },
//       { text: "오답 선택지 3", percentage: 1 },
//     ],
//   },
//   {
//     id: 2,
//     title: "Q2 (가장 많이 틀린 문제)",
//     options: [
//       { text: "정답 선택지 (15%)", percentage: 15 },
//       { text: "오답 선택지 1", percentage: 55 },
//       { text: "오답 선택지 2", percentage: 20 },
//       { text: "오답 선택지 3", percentage: 10 },
//     ],
//   },
//   {
//     id: 3,
//     title: "Q3 (일반 질문)",
//     options: [
//       { text: "옵션 A", percentage: 60 },
//       { text: "옵션 B", percentage: 20 },
//       { text: "옵션 C", percentage: 15 },
//       { text: "옵션 D", percentage: 5 },
//     ],
//   },
// ];
// const dummyScores = {
//   allScores: [
//     { name: "보보", score: 90 },
//     { name: "미미", score: 85 },
//     { name: "모모", score: 70 },
//   ],
//   myScore: 70,
// };
// // ---------------------------------

// export default function QuizResultAnalysisPage() {
//   // 컴포넌트 이름 변경
//   const { analysisId } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [details, setDetails] = useState({});
//   const [stats, setStats] = useState({});
//   const [sections, setSections] = useState([]);
//   const [scores, setScores] = useState({});

//   useEffect(() => {
//     const processDummyData = () => {
//       setLoading(true);
//       setError(null);

//       setTimeout(() => {
//         setDetails(dummyDetails);
//         setStats(dummyStats);
//         setScores(dummyScores);

//         // 어떤 질문이 '맞춘/틀린' 문제인지 ID로 지정
//         const mostCorrectQuestionId = 1;
//         const mostIncorrectQuestionId = 2;

//         const mostCorrectQuestion = dummyAllQuestions.find(
//           (q) => q.id === mostCorrectQuestionId
//         );
//         const mostIncorrectQuestion = dummyAllQuestions.find(
//           (q) => q.id === mostIncorrectQuestionId
//         );

//         const otherQuestions = dummyAllQuestions.filter(
//           (q) =>
//             q.id !== mostCorrectQuestionId && q.id !== mostIncorrectQuestionId
//         );

//         const finalSections = [
//           {
//             sectionTitle: "가장 많이 맞춘 문제",
//             questions: mostCorrectQuestion ? [mostCorrectQuestion] : [],
//           },
//           {
//             sectionTitle: "가장 많이 틀린 문제",
//             questions: mostIncorrectQuestion ? [mostIncorrectQuestion] : [],
//           },
//           {
//             sectionTitle: "다른 문제들",
//             questions: otherQuestions,
//           },
//         ].filter((section) => section.questions.length > 0);

//         setSections(finalSections);
//         setLoading(false);
//       }, 1000);
//     };

//     processDummyData();
//   }, [analysisId]);

//   if (loading) {
//     return <div>결과를 불러오는 중입니다...</div>;
//   }
//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div className="w-full min-h-screen bg-primary-dark text-gray-2">
//       <Header />
//       <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start gap-5">
//         {/* 왼쪽 패널 */}
//         <aside className="w-[212px] mt-38 mr-41 flex-shrink-0 flex flex-col gap-4 pt-6">
//           <div className="w-full p-4 border border-primary-light rounded-lg">
//             <h3 className="mb-4 font-bold text-h7">세부 정보</h3>
//             <div className="space-y-2 text-body1">
//               <div className="flex justify-between">
//                 <span>참여자 관계</span>
//                 <span className="text-gray-4">{details.relationship} ˅</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>대화 상황</span>
//                 <span className="text-[#f5f5f5]">{details.situation} ˅</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>분석 기간</span>
//                 <span className="text-gray-4">{details.period} ˅</span>
//               </div>
//             </div>
//             <button className="w-full mt-6 py-1.5 text-body2 border border-secondary rounded text-secondary hover:bg-secondary hover:text-primary-dark">
//               다시 분석
//             </button>
//           </div>
//         </aside>

//         {/* 가운데 퀴즈 본문 */}
//         <main className="w-[717px] flex-shrink-0 flex flex-col items-start mt-16 pt-6 max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
//           <h1 className="text-h3">Quiz</h1>
//           <div className="group flex w-[180px] text-button border-1 border-primary-light rounded-[2px] ml-[536px] mt-3 px-[6px] py-1 transition-colors">
//             <Link
//               to={`/play/quiz/${analysisId}`}
//               className="flex-1 flex justify-center items-center text-[#595959] whitespace-nowrap pr-[2px]"
//             >
//               퀴즈 문제 구성
//             </Link>
//             <div className="border-r border-[#bfbfbf] h-4"></div>
//             <a
//               href="#"
//               className="flex-1 flex justify-center items-center pl-[2px] text-primary-light whitespace-nowrap"
//             >
//               친구 점수 보기
//             </a>
//           </div>
//           <div className="flex justify-between items-center w-full my-8">
//             <div className="text-left">
//               <p className="text-body1 text-gray-4">친구 평균 점수</p>
//               <p className="text-h2 text-[#f5f5f5]">{stats.averageScore}점</p>
//             </div>
//             <div className="text-body1 w-25">
//               <p className="flex justify-between items-center">
//                 <span>문제 수</span>
//                 <span className="text-primary-light">
//                   {stats.questionCount}
//                 </span>
//               </p>
//               <p className="flex justify-between items-center">
//                 <span>푼 사람</span>
//                 <span className="text-primary-light">
//                   {stats.participantCount}
//                 </span>
//               </p>
//             </div>
//           </div>
//           {sections.map((section) => (
//             <div key={section.sectionTitle} className="w-full mb-8">
//               <div className="relative inline-block pt-3 mb-4">
//                 <div
//                   className="absolute top-0 h-px bg-secondary"
//                   style={{ left: "-8px", width: "calc(100% + 8px + 6px)" }}
//                 ></div>
//                 <h2 className="text-h6 text-primary-light">
//                   {section.sectionTitle}
//                 </h2>
//               </div>
//               <div className="flex flex-col gap-6">
//                 {section.questions.map((q) => (
//                   <div
//                     key={q.id}
//                     className="w-full p-5 border border-primary-light rounded-lg"
//                   >
//                     <h4 className="mb-4 font-bold text-h7">{q.title}</h4>
//                     <div className="space-y-3 text-body2">
//                       {q.options.map((opt) => (
//                         <div key={opt.text} className="flex items-center gap-4">
//                           <span className="w-2/5 truncate">{opt.text}</span>
//                           <div className="w-3/5 flex items-center gap-2">
//                             <div className="w-full bg-primary-light/20 rounded-full h-2.5">
//                               <div
//                                 className="bg-primary-light h-2.5 rounded-full"
//                                 style={{ width: `${opt.percentage}%` }}
//                               ></div>
//                             </div>
//                             <span className="w-12 text-right text-gray-4">
//                               {opt.percentage}%
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </main>

//         {/* 오른쪽 패널 */}
//         <aside className="w-[212px] mt-38 ml-[147px] flex-shrink-0 flex flex-col gap-4 pt-6">
//           <div className="w-full p-4 border border-primary-light rounded-lg">
//             <h3 className="mb-4 text-body1">개인 점수 보기</h3>
//             <div className="space-y-2 text-body2">
//               {scores.allScores?.map((s) => (
//                 <div key={s.name} className="flex justify-between">
//                   {s.name === "모모" ? (
//                     <Link
//                       to="/play/quiz/result/123"
//                       className="hover:text-[#595959] transition-colors"
//                     >
//                       {s.name}
//                     </Link>
//                   ) : (
//                     <span>{s.name}</span>
//                   )}
//                   <span className="text-gray-4">{s.score}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="w-full p-4 border border-primary-light rounded-lg">
//             <h3 className="mb-4 font-bold text-h7">URL 공유하기</h3>
//             <button className="w-full py-1.5 mb-4 text-body2 border border-secondary rounded text-secondary hover:bg-secondary hover:text-primary-dark">
//               Copy
//             </button>
//             <div className="flex justify-around">
//               <Icons.Person className="w-6 h-6 text-gray-4 cursor-pointer" />
//               <Icons.Person className="w-6 h-6 text-gray-4 cursor-pointer" />
//               <Icons.Person className="w-6 h-6 text-gray-4 cursor-pointer" />
//               <Icons.Person className="w-6 h-6 text-gray-4 cursor-pointer" />
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }
