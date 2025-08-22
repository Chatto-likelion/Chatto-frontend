// src/pages/QuizResultAnalysisPage.jsx
import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header, DetailForm_Share } from "@/components";
import * as Icons from "@/assets/svg";
import useQuizData from "@/hooks/useQuizData";

export default function QuizResultAnalysisPage() {
  const { resultId, uuid } = useParams();

  const {
    type, // 1|2|3
    shareType, // "chem" | "some" | "mbti" | null
    questions, // [{ questionId, questionIndex, title, options[4], answer(1~4), counts[4], ...}]
    scores, // [{ QP_id, name, score }]
    loading,
    error,
    resultData,
    refetch, // 필요 시 재조회에 사용 가능
  } = useQuizData(resultId, uuid);

  // ── 통계(평균/문항수/참여자수)
  const stats = useMemo(() => {
    const participantCount = Array.isArray(scores) ? scores.length : 0;
    const questionCount = Array.isArray(questions) ? questions.length : 0;
    const total = (scores ?? []).reduce(
      (sum, s) => sum + (Number(s.score) || 0),
      0
    );
    const averageScore = participantCount
      ? Math.round(total / participantCount)
      : 0;
    return { averageScore, questionCount, participantCount };
  }, [scores, questions]);

  // ── 섹션 구성: 가장 많이 맞춘/틀린/나머지
  const sections = useMemo(() => {
    const normalized = (questions ?? []).map((q) => {
      const total =
        (q.counts ?? []).reduce((a, b) => a + (Number(b) || 0), 0) || 0;
      const opts = (q.options ?? []).map((text, idx) => {
        const cnt = Number(q.counts?.[idx] ?? 0);
        const percentage = total ? Math.round((cnt / total) * 100) : 0;
        return { text, percentage, cnt };
      });
      const correctIdx = (q.answer ?? 0) - 1; // 1~4 → 0~3
      const correctRate = opts[correctIdx]?.percentage ?? 0;
      return {
        id: q.questionId,
        title: q.title,
        options: opts,
        correctRate,
      };
    });

    if (!normalized.length) return [];

    let mostCorrect = normalized[0];
    let mostIncorrect = normalized[0];
    for (const item of normalized) {
      if (item.correctRate > mostCorrect.correctRate) mostCorrect = item;
      if (item.correctRate < mostIncorrect.correctRate) mostIncorrect = item;
    }

    const others = normalized.filter(
      (q) => q.id !== mostCorrect.id && q.id !== mostIncorrect.id
    );

    const result = [];
    if (mostCorrect) {
      result.push({
        sectionTitle: "가장 많이 맞춘 문제",
        questions: [mostCorrect],
      });
    }
    if (mostIncorrect && mostIncorrect.id !== mostCorrect.id) {
      result.push({
        sectionTitle: "가장 많이 틀린 문제",
        questions: [mostIncorrect],
      });
    }
    if (others.length) {
      result.push({
        sectionTitle: "다른 문제들",
        questions: others,
      });
    }
    return result;
  }, [questions]);

  if (loading) {
    return <div>결과를 불러오는 중입니다...</div>;
  }
  if (error) {
    return <div>{String(error)}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-primary-dark text-gray-2">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start gap-5">
        {/* 왼쪽 패널 */}
        <aside className="w-[222px] flex-shrink-0 mt-53 mr-10">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm_Share
              type={type}
              value={resultData}
              isAnalysis={true}
            />
            <div className="mt-5">
              <button
                onClick={() =>
                  navigate(
                    `/play/${type == 1 ? "chemi" : shareType}/${resultId}`
                  )
                }
                disabled={loading}
                className="w-30 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border border-secondary rounded-lg"
              >
                분석 보기
              </button>
            </div>
          </div>
        </aside>

        {/* 가운데 퀴즈 본문 */}
        <main className="w-[717px] flex-shrink-0 flex flex-col items-start mt-16 pt-6 max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3">Quiz</h1>
          <div className="group flex w-[180px] text-button border-1 border-primary-light rounded-[2px] ml-[536px] mt-3 px-[6px] py-1 transition-colors">
            <Link
              to={`/play/quiz/${resultId}/${uuid}`}
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
                />
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
                        <div
                          key={`${q.id}-${opt.text}`}
                          className="flex items-center gap-4"
                        >
                          <span className="w-2/5 truncate">{opt.text}</span>
                          <div className="w-3/5 flex items-center gap-2">
                            <div className="w-full bg-primary-light/20 rounded-full h-2.5">
                              <div
                                className="bg-primary-light h-2.5 rounded-full"
                                style={{ width: `${opt.percentage}%` }}
                              />
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
              {(scores ?? []).map((s) => (
                <div
                  key={`${s.QP_id}-${s.name}`}
                  className="flex justify-between"
                >
                  {s.name === "모모" ? (
                    <Link
                      to={`/play/quiz/result/${resultId}/${uuid}`}
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
