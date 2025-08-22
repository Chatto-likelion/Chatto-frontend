// src/pages/QuizSolvePage.jsx
import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components";
// import * as Icons from "@/assets/svg"; // 현재 미사용이면 제거해도 됩니다.
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";
import useQuizGuest from "@/hooks/useQuizGuest";

export default function QuizSolvePage() {
  const { uuid } = useParams();

  const {
    loading,
    error,
    questions,
    // 필요시 타입 정보 사용 가능
    // type, shareType,
    qpId,
    started,
    startLoading,
    startGuest, // ← 이름을 인자로 전달해야 함
    submitting,
    submitGuest,
  } = useQuizGuest(uuid);

  // 로컬: 선택 답변 관리(서버 전송은 현재 스펙상 필요 없음)
  const [answers, setAnswers] = useState({});
  const [guestName, setGuestName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      if (!started && !startLoading) {
        const id = await startGuest(guestName);
        if (!id) return; // 실패 시 중단
      }
      await submitGuest(answers);
      // 성공 모달 오픈
      setIsModalOpen(true);
    } catch {
      // 훅이 error 상태를 관리하므로 여기선 별도 처리 생략
    }
  };

  const closeModal = () => setIsModalOpen(false);

  // 결과 페이지 링크(QP_id 확보 후 사용)
  const resultLink = useMemo(() => {
    return qpId ? `/play/quiz/answer/${uuid}/${qpId}` : "#";
  }, [qpId, uuid]);

  const disableSubmit =
    startLoading || submitting || (!started && guestName.trim().length === 0); // 처음 시작이면 이름 필요

  // 로딩/에러 처리(간단)
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
    <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start gap-10">
        {/* 2. 가운데 퀴즈 본문 */}
        <main className="w-[700px] flex-shrink-0 flex flex-col items-center pt-6 mt-16 max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3 w-full mb-4">Quiz</h1>

          <div className="flex justify-end items-center w-full mb-4 gap-2">
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
              {submitting || startLoading ? "제출 중..." : "결과 제출하기"}
            </button>

            <Link
              to="/about"
              className="text-button border border-gray-2 text-gray-2 rounded w-[110px] h-[32px] hover:bg-primary-light hover:text-primary-dark flex justify-center items-center"
            >
              나도 분석하기
            </Link>
          </div>

          <div className="w-full flex flex-col gap-6">
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
