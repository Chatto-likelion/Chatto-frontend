// src/pages/QuizSolvePage.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Header, DetailForm_Share } from "@/components";
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";
import useQuizGuest from "@/hooks/useQuizGuest";

export default function QuizSolvePage() {
  const { uuid } = useParams();

  const {
    loading,
    error,
    type,
    resultData,
    questions,
    qpId,
    started,
    startLoading,
    startGuest, // startGuest(name)
    submitting,
    submitGuest, // submitGuest(answersMap)
  } = useQuizGuest(uuid);

  console.log(questions);
  const [answers, setAnswers] = useState({});
  const [guestName, setGuestName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 첫 클릭에서 이름 등록 후, 재렌더가 끝난 다음 자동 제출하기 위한 플래그/버퍼
  const [pendingAutoSubmit, setPendingAutoSubmit] = useState(false);
  const pendingAnswersRef = useRef(null);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => {
      if (prev[questionId] === optionIndex) {
        const next = { ...prev };
        delete next[questionId];
        return next;
      }
      return { ...prev, [questionId]: optionIndex };
    });
  };

  const handleSubmit = async () => {
    try {
      // 아직 시작 전이면: 이름 등록만 하고, 제출은 re-render 이후 effect에서 자동 수행
      if (!started) {
        const name = guestName.trim();
        if (!name) return; // 이름 없으면 아무 것도 하지 않음 (버튼 disabled에도 걸려있음)
        pendingAnswersRef.current = answers; // 현재 답변 저장
        setPendingAutoSubmit(true); // 자동 제출 예약
        await startGuest(name); // qpId 설정 → re-render 유도
        return; // 여기선 submitGuest 호출하지 않음!
      }

      // 이미 시작된 상태면 바로 제출
      await submitGuest(answers);
      setIsModalOpen(true);
    } catch {
      // 훅에서 error 상태 관리하므로 별도 처리 생략
    }
  };

  // 이름 등록이 끝나 qpId/started가 세팅되면 자동으로 제출 수행
  useEffect(() => {
    if (!pendingAutoSubmit) return;
    if (!started || !qpId) return;

    (async () => {
      try {
        await submitGuest(pendingAnswersRef.current || {});
        setIsModalOpen(true);
      } finally {
        setPendingAutoSubmit(false); // 중복 방지
        pendingAnswersRef.current = null;
      }
    })();
  }, [pendingAutoSubmit, started, qpId, submitGuest]);

  const closeModal = () => setIsModalOpen(false);

  const resultLink = useMemo(() => {
    return qpId ? `/play/quiz/answer/${uuid}/${qpId}` : "#";
    // 모달은 제출 성공 후에만 열리므로, 열릴 땐 qpId가 존재
  }, [qpId, uuid]);

  const disableSubmit =
    startLoading ||
    submitting ||
    pendingAutoSubmit ||
    (!started && guestName.trim().length === 0); // 처음엔 이름 필수

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <p className="text-body1">퀴즈를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-72px)] text-red-500">
          <p className="text-body1">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start items-center h-screen text-white bg-primary-dark">
      <Header />
      <div className="w-full max-w-[1400px] overflow-hidden mt-18 flex justify-center items-start gap-10">
        {/*왼쪽*/}
        <aside className="w-[222px] flex-shrink-0 mt-53 mr-10">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm_Share
              type={type}
              value={resultData}
              isAnalysis={true}
            />
          </div>
        </aside>

        {/*가운데*/}
        <main className="w-[717px] flex-shrink-0 flex flex-col items-start mt-16 pt-6 max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3 w-[700px] mb-4">Quiz</h1>

          <div className="flex justify-end items-center w-[700px] mb-4 gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="quiz-name" className="text-sm text-gray-2">
                이름
              </label>
              <input
                id="quiz-name"
                type="text"
                placeholder="이름을 입력해주세요"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-primary-dark border border-primary-light rounded w-[190px] h-[32px] pl-3 text-body2"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={disableSubmit}
              className="text-button border border-gray-2 rounded w-[110px] h-[32px] ml-3 hover:bg-primary-light hover:text-primary-dark disabled:opacity-50"
            >
              {submitting || startLoading || pendingAutoSubmit
                ? "제출 중..."
                : "결과 제출하기"}
            </button>

            <Link
              to="/about"
              className="text-button border border-gray-2 text-gray-2 rounded w-[110px] h-[32px] hover:bg-primary-light hover:text-primary-dark flex justify-center items-center"
            >
              나도 분석하기
            </Link>
          </div>

          <div className="w-[700px] flex flex-col gap-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="w-full p-5 border border-primary-light rounded-lg"
              >
                <h2 className="text-h7 mb-4">{q.title}</h2>
                <div className="space-y-0">
                  {q.options.map((optionText, optIndex) => (
                    <div
                      key={optIndex}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      className="flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                    >
                      <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                        <CheckBoxIcon className="absolute w-4 h-4" />
                        {answers[q.id] === optIndex && (
                          <CheckBoxCheckIcon className="absolute top-0 left-0 w-full h-full text-red-500" />
                        )}
                      </div>
                      <span className="text-body1">{optionText}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/*오른쪽*/}
      </div>

      {/* 제출 완료 모달 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-primary-dark border border-primary-light text-h5 rounded-lg p-10 flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-h6">제출이 완료되었습니다</p>
            <Link
              to={resultLink}
              className={`text-button rounded px-8 py-2 hover:bg-opacity-80 ${
                qpId
                  ? "bg-secondary-light text-primary-dark"
                  : "bg-gray-600 text-white pointer-events-none opacity-70"
              }`}
            >
              나의 결과 보러가기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
