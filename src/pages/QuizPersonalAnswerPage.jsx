// src/pages/QuizPersonalAnswerPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header, DetailForm_Share, ShareModal } from "@/components";
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
    sections, // [{ sectionTitle, questions:[{ id, title, options[], correctOptionIndex, userSelectedOptionIndex }]}]
    owner, // { name, score }
    resultData,
    type,
    // 로딩/에러
    loading,
    resultLoading,
    error,

    fetchMyPersonalResult, // (qpId?: string|number) => Promise<void>
  } = useQuizGuest(uuid);

  // 진입 시 URL의 qpId로 바로 내 결과 조회
  useEffect(() => {
    if (!uuid || !qpId) return;
    fetchMyPersonalResult(qpId);
  }, [uuid, qpId, fetchMyPersonalResult]);

  // ── 공유 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const openShareModal = () => setModalOpen(true);
  const closeShareModal = () => setModalOpen(false);

  // 공유 URL: some 페이지 레퍼런스와 동일 우선순위
  const shareUrl = useMemo(() => {
    const base = window.location.origin;
    if (uuid) {
      return `${base}/play/quiz/solve/${uuid}`;
    }
  }, [uuid]);

  // 전체 문항/정답 개수 집계
  const { totalCount, correctCount } = useMemo(() => {
    console.log("sec: ", sections);
    const all = (sections ?? []).flatMap((s) => s?.questions ?? []);
    const total = all.length;
    const correct = all.reduce((acc, q) => {
      const ci = q?.correctOptionIndex;
      const ui = q?.userSelectedOptionIndex;
      return Number.isInteger(ci) && ci >= 0 && ui === ci ? acc + 1 : acc;
    }, 0);
    return { totalCount: total, correctCount: correct };
  }, [sections]);

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
    <div className="w-full min-h-screen bg-primary-dark text-gray-2">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start">
        {/*왼쪽*/}
        <aside className="w-[222px] flex-shrink-0 mt-44 mr-10">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm_Share
              type={type}
              value={resultData}
              isAnalysis={true}
            />
          </div>
        </aside>

        {/* 가운데 퀴즈 본문 */}
        <main className="w-[1023px] px-[153px] pb-20 flex flex-col justify-start max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3 w-full mt-25 mb-4">Quiz</h1>

          <div className="flex justify-between items-end w-full mt-2 mb-5">
            {/* 점수 + 정답 개수/전체 */}
            <p className="mb-1 text-h4 text-primary-light">
              {owner?.score ?? 0}점{" "}
              <span className="text-body1 text-gray-4 ml-2">
                ({correctCount}/{totalCount})
              </span>
            </p>
            <div className="flex justify-end items-end gap-2">
              <Link
                to={shareUrl}
                className="text-button border border-gray-2 rounded w-[110px] h-[32px] hover:bg-primary-light hover:text-primary-dark flex justify-center items-center"
              >
                퀴즈 다시 풀기
              </Link>
              <button
                onClick={openShareModal}
                className="text-button border border-gray-2 rounded w-[110px] h-[32px] hover:bg-primary-light hover:text-primary-dark flex justify-center items-center"
              >
                퀴즈 공유하기
              </button>
              <Link
                to="/about"
                className="text-button border border-gray-2 text-gray-2 rounded w-[110px] h-[32px] hover:bg-primary-light hover:text-primary-dark flex justify-center items-center"
              >
                나도 분석하기
              </Link>
            </div>
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
                    {q.options.map((opt, optIndex) => {
                      const isCorrectOpt = optIndex === q.correctOptionIndex;
                      const isUserSelected =
                        optIndex === q.userSelectedOptionIndex;
                      const isUserCorrect =
                        isUserSelected &&
                        Number.isInteger(q.correctOptionIndex) &&
                        q.correctOptionIndex >= 0 &&
                        q.userSelectedOptionIndex === q.correctOptionIndex;

                      return (
                        <div
                          key={optIndex}
                          className={`flex justify-between items-center p-3 rounded-md ${
                            isCorrectOpt ? "bg-green-500/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                              <CheckBoxIcon className="absolute w-4 h-4" />
                              {isUserSelected && (
                                <CheckBoxCheckIcon className="absolute left-0 bottom-0 w-full h-full text-primary-light transform -translate-y-1" />
                              )}
                            </div>
                            <span className="text-body2">{opt}</span>
                          </div>

                          <div>
                            {isUserSelected && isUserCorrect && (
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            )}
                            {isUserSelected && !isUserCorrect && (
                              <XCircleIcon className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </main>

        <ShareModal
          open={modalOpen}
          onClose={closeShareModal}
          url={shareUrl}
          loading={false}
          error={null}
        />
      </div>
    </div>
  );
}
