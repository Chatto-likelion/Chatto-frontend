// src/pages/QuizResultPage.jsx
import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components";
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";
import CheckCircleIcon from "@/assets/svg/CheckCircle.svg?react";
import XCircleIcon from "@/assets/svg/XCircle.svg?react";
import useQuizData from "@/hooks/useQuizData";

export default function QuizResultPage() {
  const { analysisId } = useParams();

  // type: 1 = chemi
  const { loading, error, questions, scores, overview } = useQuizData(
    1,
    analysisId
  );

  // 오른쪽 패널 - 점수 목록 정렬
  const sortedScores = useMemo(() => {
    if (!Array.isArray(scores)) return [];
    return [...scores].sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));
  }, [scores]);

  // 가운데 타이틀의 "개인 점수 - {이름}"은 우선 1등 표시(별도 선택 UX가 생기면 교체)
  const ownerName = sortedScores[0]?.name ?? "-";

  // 툴팁(정답 바 호버) 상태
  const [hover, setHover] = useState({ qid: null, show: false });

  if (loading) {
    return <div>결과를 불러오는 중입니다...</div>;
  }
  if (error) {
    return (
      <div className="text-red-500">
        결과를 불러오는 중 오류가 발생했어요: {String(error)}
      </div>
    );
  }

  // 왼쪽 패널 세부 정보(overview가 제공하는 경우 표시)
  const details = {
    relationship: overview?.result?.relationship ?? "-",
    situation: overview?.result?.situation ?? "-",
    period:
      overview?.result?.analysis_date_start &&
      overview?.result?.analysis_date_end
        ? `${overview.result.analysis_date_start} ~ ${overview.result.analysis_date_end}`
        : "-",
  };

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
                <span className="text-[#f5f5f5]">{details.period} ˅</span>
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
            개인 점수 - {ownerName}
          </h2>

          <div className="flex justify-between items-center w-full my-8">
            {/* 점수 카드가 따로 있다면 여기에 배치 */}
          </div>

          <div className="w-full flex flex-col gap-6">
            {questions.map((q) => {
              const total =
                (q.counts ?? []).reduce((a, b) => a + (Number(b) || 0), 0) || 0;

              return (
                <div
                  key={q.questionId}
                  className="w-full p-5 border border-primary-light rounded-lg"
                >
                  <h4 className="font-bold text-h7 mb-4">{q.title}</h4>

                  <div className="space-y-0">
                    {q.options.map((opt, optIndex) => {
                      const c = Number(q.counts?.[optIndex] ?? 0);
                      const pct = total ? Math.round((c / total) * 100) : 0;
                      const isCorrect = (q.answer ?? 0) - 1 === optIndex;

                      return (
                        <div
                          key={optIndex}
                          className={`relative flex justify-between items-center p-3 rounded-md overflow-hidden ${
                            isCorrect ? "bg-green-500/10" : ""
                          }`}
                        >
                          {/* 퍼센트 바 (뒤 배경) */}
                          <div
                            className={`absolute left-0 top-0 h-full opacity-20 ${
                              isCorrect ? "bg-green-500" : "bg-[#888]"
                            }`}
                            style={{ width: `${pct}%` }}
                            onMouseEnter={() =>
                              isCorrect &&
                              setHover({ qid: q.questionId, show: true })
                            }
                            onMouseLeave={() =>
                              isCorrect && setHover({ qid: null, show: false })
                            }
                          />

                          {/* 툴팁: 정답 바 위에 호버 시, 맞힌 사람 명수 + 이름 */}
                          {isCorrect &&
                            hover.show &&
                            hover.qid === q.questionId && (
                              <div className="absolute -top-8 left-0 z-10 bg-black text-white text-xs rounded px-2 py-1 whitespace-pre-wrap max-w-[520px]">
                                {q.correctNames?.length
                                  ? `${
                                      q.correctNames.length
                                    }명: ${q.correctNames.join(", ")}`
                                  : "맞힌 사람이 아직 없습니다"}
                              </div>
                            )}

                          {/* 좌측: 체크박스 + 보기 텍스트 */}
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                              <CheckBoxIcon className="absolute w-4 h-4" />
                              {/* 개인 선택 정보가 없으므로 선택 체크는 숨김.
                                  필요 시 개인 상세(QP 선택) 연동 후 표시 */}
                              {/* <CheckBoxCheckIcon ... /> */}
                            </div>
                            <span className="text-body2">{opt}</span>
                          </div>

                          {/* 우측: 퍼센트/정답 아이콘 */}
                          <div className="flex items-center gap-2 relative z-10">
                            <span className="text-caption text-[#f5f5f5]">
                              {pct}%
                            </span>
                            {isCorrect ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircleIcon className="w-5 h-5 text-transparent" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* 3. 오른쪽 패널 */}
        <aside className="w-[212px] flex-shrink-0 flex flex-col gap-4 pt-6 mt-48 ml-[147px]">
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <Link
              to={`/play/quiz/Result/Analysis/${analysisId}`}
              className="flex justify-center text-body2 mb-3 hover:text-[#595959] transition-colors"
            >
              전체 점수 보기
            </Link>

            <hr className="border-t border-primary-light" />

            {/* 개인 점수 섹션 */}
            <div className="mt-4">
              <p className="font-bold text-body2 mb-2">개인 점수</p>
              <div className="space-y-2 text-body2">
                {sortedScores.map((s) => (
                  <div
                    key={`${s.QP_id}-${s.name}`}
                    className="flex justify-between"
                  >
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
