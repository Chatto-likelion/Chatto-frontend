import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Header,
  SmallServices,
  DetailForm_Share,
  ShareModal,
} from "@/components";
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";
import useQuizData from "@/hooks/useQuizData";

export default function QuizPage() {
  const { resultId, uuid } = useParams();
  const navigate = useNavigate();

  const {
    type,
    shareType,
    questions,
    loading,
    error,
    resultData,
    addOne,
    updateOne,
    deleteOne,
    deleteAll,
    refetch,
  } = useQuizData(resultId, uuid);

  // 공유 모달(별도)
  const [modalOpen, setModalOpen] = useState(false);
  const openShareModal = () => setModalOpen(true);
  const closeShareModal = () => setModalOpen(false);

  // 퀴즈 삭제 진행 상태
  const [deleting, setDeleting] = useState(false);

  // 공유 URL
  const shareUrl = useMemo(() => {
    const base = window.location.origin;
    return uuid
      ? `${base}/play/quiz/solve/${uuid}`
      : `${base}/play/quiz/result/${resultId}/${uuid}`;
  }, [resultId, uuid, shareType]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);

  const [drafts, setDrafts] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});

  // + 버튼용 확인 모달
  const [addConfirmOpen, setAddConfirmOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const mainRef = useRef(null);
  const shouldScrollAfterAddRef = useRef(false);

  const scrollMainToBottom = () => {
    const el = mainRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const prevLenRef = useRef(questions.length);

  useEffect(() => {
    const increased = questions.length > prevLenRef.current;
    if (increased && shouldScrollAfterAddRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollMainToBottom);
      });
      shouldScrollAfterAddRef.current = false;
    }
    prevLenRef.current = questions.length;
  }, [questions.length]);

  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null); // { qIndex, payload }

  const questionByIndex = useMemo(() => {
    const m = new Map();
    questions.forEach((q) => m.set(q.questionIndex, q));
    return m;
  }, [questions]);

  const handleToggleEdit = async (qIndex) => {
    if (editingIndex === qIndex) {
      const base = questionByIndex.get(qIndex);
      const draft = drafts[qIndex] ?? {
        title: base?.title ?? "",
        options: base?.options ?? ["", "", "", ""],
        answer: base?.answer ?? 1,
      };
      const sel = correctAnswers[qIndex];
      const answer = Number.isInteger(sel) ? sel + 1 : draft.answer;

      setPendingUpdate({
        qIndex,
        payload: { title: draft.title, options: draft.options, answer },
      });
      setUpdateConfirmOpen(true);
      return;
    }

    const q = questionByIndex.get(qIndex);
    if (!q) return;
    setDrafts((prev) => ({
      ...prev,
      [qIndex]: { title: q.title, options: [...q.options], answer: q.answer },
    }));
    setCorrectAnswers((prev) => ({
      ...prev,
      [qIndex]: (q.answer ?? 1) - 1,
    }));
    setEditingIndex(qIndex);
  };

  const handleQuestionChange = (qIndex, newTitle) => {
    setDrafts((prev) => ({
      ...prev,
      [qIndex]: {
        ...(prev[qIndex] ?? {
          title: "",
          options: ["", "", "", ""],
          answer: 1,
        }),
        title: newTitle,
      },
    }));
  };

  const handleOptionChange = (qIndex, optIdx, newText) => {
    setDrafts((prev) => {
      const base =
        prev[qIndex] ??
        (() => {
          const q = questionByIndex.get(qIndex);
          return {
            title: q?.title ?? "",
            options: q?.options ? [...q.options] : ["", "", "", ""],
            answer: q?.answer ?? 1,
          };
        })();
      const nextOptions = [...base.options];
      nextOptions[optIdx] = newText;
      return { ...prev, [qIndex]: { ...base, options: nextOptions } };
    });
  };

  const handleSelectCorrectAnswer = (qIndex, optIdx) => {
    setCorrectAnswers((prev) => ({ ...prev, [qIndex]: optIdx }));
  };

  const handleToggleDeleteConfirm = (qIndex) => {
    setDeletingIndex((cur) => (cur === qIndex ? null : qIndex));
  };

  const handleDeleteConfirm = async (qIndex) => {
    try {
      await deleteOne(qIndex);
    } catch (err) {
      console.error("퀴즈 문항 삭제 실패:", err);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeletingIndex(null);
      if (editingIndex === qIndex) setEditingIndex(null);
    }
  };

  const handleAddQuestion = async () => {
    try {
      setAdding(true);
      shouldScrollAfterAddRef.current = true;
      await addOne();
      await refetch();
    } catch (err) {
      console.error("퀴즈 추가 실패:", err);
      alert("문항 추가에 실패했습니다.");
      shouldScrollAfterAddRef.current = false;
    } finally {
      setAdding(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingUpdate) return;
    try {
      setUpdating(true);
      await updateOne(pendingUpdate.qIndex, pendingUpdate.payload);
      setEditingIndex(null);
    } catch (err) {
      console.error("퀴즈 업데이트 실패:", err);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUpdating(false);
      setUpdateConfirmOpen(false);
      setPendingUpdate(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!deleteAll) {
      alert("삭제 기능이 준비되지 않았습니다.");
      return;
    }
    if (
      !window.confirm("정말로 이 퀴즈 전체를 삭제할까요? 복구할 수 없습니다.")
    ) {
      return;
    }

    setDeleting(true);

    navigate(`/play/${type == 1 ? "chemi" : shareType}/${resultId}`);
    deleteAll()
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setDeleting(false));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-dark text-gray-2">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-body1">퀴즈를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-dark text-gray-2">
        <Header />
        <div className="flex-1 flex items-center justify-center text-red-500">
          <p className="text-h6">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start">
        <aside className="w-[222px] flex-shrink-0 mt-44 mr-10">
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

        {/* 본문 */}
        <main
          ref={mainRef}
          className="w-[1023px] px-[153px] pb-20 flex flex-col justify-start max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide"
        >
          <div className="w-full flex flex-col items-end">
            <h1 className="w-full text-h3 pt-25">Quiz</h1>
            <div className="group flex w-[180px] text-button border-1 border-primary-light rounded-[2px] my-6 px-[6px] py-1">
              <span className="flex-1 flex justify-center items-center text-primary-light pr-[2px]">
                퀴즈 문제 구성
              </span>
              <div className="border-r border-[#bfbfbf] h-4" />
              <Link
                to={`/play/quiz/result/analysis/${resultId}/${uuid}`}
                className="flex-1 flex justify-center items-center pl-[2px] text-[#595959]"
              >
                친구 점수 보기
              </Link>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            {questions.map((q) => {
              const qIndex = q.questionIndex;
              const isEditing = editingIndex === qIndex;
              const isDeleting = deletingIndex === qIndex;
              const draft = drafts[qIndex] ?? {
                title: q.title,
                options: q.options,
                answer: q.answer,
              };

              return (
                <div
                  key={q.questionId}
                  className="w-full pt-3 pb-3 pl-4 pr-[14px] border border-primary-light rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, e.target.value)
                        }
                        className="text-h7 bg-transparent border-b border-gray-500 text-gray-5 focus:outline-none w-full"
                      />
                    ) : (
                      <h2 className="text-h7">{q.title}</h2>
                    )}
                    <div className="flex items-center flex-shrink-0 ml-4">
                      <span
                        onClick={() => handleToggleEdit(qIndex)}
                        className="text-button text-[#d9d9d9] cursor-pointer whitespace-nowrap"
                      >
                        {isEditing ? "완료" : "수정"}
                      </span>
                      <span
                        onClick={() => handleToggleDeleteConfirm(qIndex)}
                        className="text-button text-red-500 cursor-pointer whitespace-nowrap ml-2"
                      >
                        삭제
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {isDeleting ? (
                      <div className="flex flex-col items-center gap-3 bg-[#434343] border border-gray-500 py-4 px-4 rounded-md">
                        <p className="text-body2 text-gray-2">
                          해당 문제가 삭제되며, 이전 버전의 퀴즈를 푼 데이터가
                          모두 삭제됩니다.
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleDeleteConfirm(qIndex)}
                            className="text-button text-red-500 hover:text-red-400"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => handleToggleDeleteConfirm(qIndex)}
                            className="text-button text-gray-400 hover:text-white"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      draft.options.map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center text-body2 rounded-md"
                        >
                          <div className="flex items-center w-full">
                            <div
                              className="relative w-6 h-6 mr-2 cursor-pointer flex-shrink-0"
                              onClick={
                                isEditing
                                  ? () =>
                                      setCorrectAnswers((prev) => ({
                                        ...prev,
                                        [qIndex]: i,
                                      }))
                                  : undefined
                              }
                            >
                              <CheckBoxIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5" />
                              {(correctAnswers[qIndex] ?? q.answer - 1) ===
                                i && (
                                <CheckBoxCheckIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6" />
                              )}
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  handleOptionChange(qIndex, i, e.target.value)
                                }
                                className="text-body2 bg-transparent text-gray-5 focus:outline-none w-full"
                              />
                            ) : (
                              <span>{q.options[i]}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full flex justify-center mt-6">
            {adding ? (
              <span
                className={`inline-block w-5 h-5 rounded-full border-2 border-secondary-light border-t-transparent animate-spin`}
              />
            ) : (
              <button
                onClick={() => setAddConfirmOpen(true)}
                className="text-h4 text-primary-light hover:text-gray-2"
              >
                +
              </button>
            )}
          </div>
        </main>

        {/* 오른쪽 */}
        <aside className="w-[244px] mt-44 flex-shrink-0 flex flex-col gap-4">
          <div className="w-full p-4">
            <div className="w-full flex justify-between items-center gap-3">
              <button
                onClick={openShareModal}
                className="flex-1 py-1.5 text-button border-1 border-secondary-light rounded-[4px] text-secondary-light hover:bg-secondary hover:text-primary-dark"
              >
                결과 공유
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className={[
                  "flex-1 py-1.5 text-button border-1 rounded-[4px]",
                  deleting
                    ? "border-secondary-light text-secondary-light cursor-not-allowed"
                    : "border-secondary-light text-secondary-light hover:bg-secondary hover:text-primary-dark",
                ].join(" ")}
              >
                {deleting ? "삭제 중..." : "퀴즈 삭제"}
              </button>
            </div>
          </div>
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <SmallServices />
          </div>
        </aside>
      </div>

      {/* 공유 모달 */}
      <ShareModal
        open={modalOpen}
        onClose={closeShareModal}
        url={shareUrl}
        loading={false}
        error={null}
      />

      {/* + 버튼 확인 모달 */}
      {addConfirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => !adding && setAddConfirmOpen(false)}
        >
          <div
            className="w-[420px] max-w-[90vw] rounded-lg border border-secondary-light bg-primary-dark p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-h7 mb-2">퀴즈 문항 추가</h3>
            <p className="text-body2 text-gray-4 mb-4">
              새 문제를 추가하시겠어요?{" "}
              <span className="text-secondary-light font-semibold">1C</span>가
              소모됩니다.
            </p>
            <p className="text-body2 text-red-500 mb-4">
              또한, 이전 버전의 퀴즈를 푼 데이터가 모두 삭제됩니다.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setAddConfirmOpen(false)}
                disabled={adding}
                className="px-4 py-1.5 text-button border border-secondary-light rounded hover:bg-gray-600/30 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  await handleAddQuestion();
                  setAddConfirmOpen(false);
                }}
                disabled={adding}
                className="px-4 py-1.5 text-button border border-secondary-light rounded hover:bg-secondary hover:text-primary-dark disabled:opacity-50"
              >
                {adding ? "추가 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 완료(수정 저장) 확인 모달 */}
      {updateConfirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => !updating && setUpdateConfirmOpen(false)}
        >
          <div
            className="w-[420px] max-w-[90vw] rounded-lg border border-secondary-light bg-primary-dark p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-h7 mb-2">수정 내용 저장</h3>
            <p className="text-body2 text-gray-4 mb-4">
              변경한 내용을 저장하시겠어요?
            </p>
            <p className="text-body2 text-red-500 mb-4">
              저장하면 이전 버전의 퀴즈를 푼 데이터가 모두 삭제됩니다.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setUpdateConfirmOpen(false)}
                disabled={updating}
                className="px-4 py-1.5 text-button border border-secondary-light rounded hover:bg-gray-600/30 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmUpdate}
                disabled={updating}
                className="px-4 py-1.5 text-button border border-secondary-light rounded hover:bg-secondary hover:text-primary-dark disabled:opacity-50"
              >
                {updating ? "저장 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
