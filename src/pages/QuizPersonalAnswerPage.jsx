// src/pages/QuizPersonalAnswerPage.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components";
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";
import CheckCircleIcon from "@/assets/svg/CheckCircle.svg?react";
import XCircleIcon from "@/assets/svg/XCircle.svg?react";
import useQuizGuest from "@/hooks/useQuizGuest";

export default function QuizPersonalAnswerPage() {
  // URL: /play/quiz/answer/:uuid/:qpId
  const { uuid, qpId } = useParams();

  const {
    // 개인 결과 상태
    details, // { relationship, situation, period } (필요하면 사용)
    sections, // [{ sectionTitle, questions:[{ id, title, options[], correctOptionIndex, userSelectedOptionIndex }] }]
    owner, // { name, score }

    // 로딩/에러
    loading, // 기본(문제 로드 등) 로딩
    resultLoading, // 개인 결과 로딩
    error, // 에러 메시지(문자열)

    // 메서드
    fetchMyPersonalResult, // (qpId?: string|number) => Promise<void>
  } = useQuizGuest(uuid);

  // 진입 시 URL의 qpId로 바로 내 결과 조회
  useEffect(() => {
    if (!uuid || !qpId) return;
    fetchMyPersonalResult(qpId);
  }, [uuid, qpId, fetchMyPersonalResult]);

  // 로딩/에러 처리
  if (loading || resultLoading) {
    return (
      <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <p className="text-body1">결과를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-72px)] text-red-500">
          {String(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start gap-10">
        {/* 가운데 퀴즈 본문 */}
        <main className="w-[650px] flex-shrink-0 flex flex-col items-start pt-6 mt-16 max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3">Quiz</h1>
          <h2 className="text-body1 text-primary-light mt-2">
            개인 점수 - {owner?.name ?? "-"}
          </h2>
          <div className="flex justify-between items-center w-full my-5">
            <p className="text-h4 text-primary-light">{owner?.score ?? 0}점</p>
          </div>

          <div className="w-full flex flex-col gap-6">
            {(sections ?? [])
              .flatMap((section) => section?.questions ?? [])
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
      </div>
    </div>
  );
}
