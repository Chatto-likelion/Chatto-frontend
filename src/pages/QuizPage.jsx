import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header, SmallServices, DetailForm_Share } from "@/components";
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

  const [editingIndex, setEditingIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);

  const [drafts, setDrafts] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});

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

      try {
        await updateOne(qIndex, {
          title: draft.title,
          options: draft.options,
          answer,
        });
        // 'updateOne'이 내부적으로 상태를 업데이트하므로 refetch()는 필요 없습니다.
      } catch (err) {
        console.error("퀴즈 업데이트 실패:", err);
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setEditingIndex(null);
      }
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
      // 'deleteOne'이 내부적으로 상태를 업데이트하므로 refetch()는 필요 없습니다.
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
      await addOne();
      await refetch(); // 새 항목 추가 후에는 refetch가 필요합니다.
    } catch (err) {
      console.error("퀴즈 추가 실패:", err);
      alert("문항 추가에 실패했습니다.");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "정말로 모든 문제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }
    try {
      await deleteAll();
    } catch (err) {
      console.error("퀴즈 전체 삭제 실패:", err);
      alert("전체 삭제에 실패했습니다. 다시 시도해주세요.");
    }
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

        {/* 본문 */}
        <main className="w-[1023px] pb-20 flex flex-col justify-start max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3 ml-43 pt-25">Quiz</h1>

          <div className="group flex w-[180px] text-button border-1 border-primary-light rounded-[2px] ml-[588px] my-6 px-[6px] py-1">
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

          <div className="w-[600px] flex flex-col gap-4">
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
                  className="w-[600px] ml-43 pt-3 pb-3 pl-4 pr-[14px] border border-primary-light rounded-lg"
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
                          해당 문제가 삭제되며, 친구들의 정답 데이터도 함께
                          사라집니다
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
                                  ? () => handleSelectCorrectAnswer(qIndex, i)
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
            <button
              onClick={handleAddQuestion}
              className="text-h4 text-primary-light hover:text-gray-2"
            >
              +
            </button>
          </div>
        </main>

        <aside className="w-53 flex flex-col mt-53 gap-4">
          <div className="w-full p-4 flex flex-col items-center border border-primary-light rounded-lg">
            <button
              onClick={() => navigate(-1)}
              className="mt-6 w-[79px] h-[34px] flex justify-center items-center text-button border border-secondary rounded-lg hover:bg-secondary hover:text-primary-dark"
            >
              뒤로
            </button>
          </div>
          <div className="w-full flex flex-row gap-2">
            <button
              onClick={handleAddQuestion}
              className="w-[90px] h-7 text-button border border-secondary rounded-lg hover:bg-secondary hover:text-primary-dark"
            >
              퀴즈 생성
            </button>
            <button
              onClick={handleDeleteAll}
              className="w-[90px] h-7 text-button border border-secondary rounded-lg hover:bg-secondary hover:text-primary-dark"
            >
              전체 삭제
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
