import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Header,
  FileUpload,
  ChatList,
  SmallServices,
  DetailForm_Share,
} from "@/components";
import { useQuizData } from "../hooks/useQuizData";
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";

export default function QuizPage() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const { questions, details, loading, error, setQuestions } =
    useQuizData(analysisId);

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const handleSelectCorrectAnswer = (questionId, optionIndex) => {
    setCorrectAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionIndex,
    }));
  };
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);

  //수정/완료 버튼을 누를 때 호출될 함수
  const handleToggleEdit = (questionId) => {
    setEditingQuestionId((currentId) =>
      currentId === questionId ? null : questionId
    );
  };

  // 질문 제목이 변경될 때 호출될 함수
  const handleQuestionChange = (questionId, newTitle) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((q) =>
        q.id === questionId ? { ...q, title: newTitle } : q
      )
    );
  };

  //선택지 내용이 변경될 때 호출될 함수
  const handleOptionChange = (questionId, optionIndex, newText) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = newText;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // handleAddQuestion 함수
  const handleAddQuestion = () => {
    const newQuestionId = Date.now();
    const newQuestion = {
      id: newQuestionId,
      title: "새로운 질문",
      options: ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
    };
    setQuestions((currentQuestions) => [...currentQuestions, newQuestion]);
    setEditingQuestionId(newQuestionId);
  };

  const handleToggleDeleteConfirm = (questionId) => {
    setDeletingQuestionId((currentId) =>
      currentId === questionId ? null : questionId
    );
  };

  const handleDeleteConfirm = (questionId) => {
    setQuestions((currentQuestions) =>
      currentQuestions.filter((q) => q.id !== questionId)
    );
    setDeletingQuestionId(null);
  };

  // 로딩 및 에러 처리
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-dark text-gray-2">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-body1">퀴즈를 생성 중입니다...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-dark text-gray-2">
        <Header />
        <div className="flex-1 flex items-center justify-center text-red-500">
          <p className="text-h6">{error}</p>
        </div>
      </div>
    );
  }
  // 컴포넌트의 메인 return 문
  return (
    <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start">
        {/* 왼쪽 패널 */}
        <aside className="w-[222px] flex-shrink-0 mt-53 mr-10 ">
          <div className="flex flex-col gap-5"></div>
        </aside>

        {/* 가운데 + 오른쪽 패널 컨테이너 */}
        <main className="w-[1023px] flex flex-col justify-start max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <h1 className="text-h3 text-[#f5f5f5] ml-30 pt-25">Quiz</h1>
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
            {questions.map((q) => {
              const isEditing = editingQuestionId === q.id;
              const isDeleting = deletingQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  className="w-[600px] ml-43 pt-3 pb-3 pl-4 pr-[14px] border border-primary-light rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    {/* ✅ FIX: 질문 제목 UI가 항상 보이도록 복원 */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={q.title}
                        onChange={(e) =>
                          handleQuestionChange(q.id, e.target.value)
                        }
                        className="text-h7 bg-transparent border-b border-gray-500 text-gray-5 focus:outline-none w-full"
                      />
                    ) : (
                      <h2 className="text-h7">{q.title}</h2>
                    )}
                    {/* ✅ FIX: 수정/삭제 버튼이 항상 오른쪽 상단에 위치하도록 복원 */}
                    <div className="flex items-center flex-shrink-0 ml-4">
                      <span
                        onClick={() => handleToggleEdit(q.id)}
                        className="text-button text-[#d9d9d9] cursor-pointer whitespace-nowrap"
                      >
                        {isEditing ? "완료" : "수정"}
                      </span>
                      <span
                        onClick={() => handleToggleDeleteConfirm(q.id)}
                        className="text-button text-red-500 cursor-pointer whitespace-nowrap ml-2"
                      >
                        삭제
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {isDeleting ? (
                      // ✅ FIX: 삭제 확인 UI를 버튼 옆이 아닌 하단 컨텐츠 영역에 표시
                      <div className="flex flex-col items-center gap-3 bg-[#434343] border border-gray-500 py-4 px-4 rounded-md">
                        <p className="text-body2 text-gray-2">
                          해당 문제가 삭제되며, 친구들의 정답 데이터도 함께
                          사라집니다
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleDeleteConfirm(q.id)}
                            className="text-button text-red-500 hover:text-red-400"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => handleToggleDeleteConfirm(null)}
                            className="text-button text-gray-400 hover:text-white"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      q.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center text-body2 rounded-md"
                        >
                          <div className="flex items-center w-full">
                            <div
                              className="relative w-6 h-6 mr-2 cursor-pointer flex-shrink-0"
                              onClick={() =>
                                handleSelectCorrectAnswer(q.id, index)
                              }
                            >
                              <CheckBoxIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5" />
                              {correctAnswers[q.id] === index && (
                                <CheckBoxCheckIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6" />
                              )}
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  handleOptionChange(
                                    q.id,
                                    index,
                                    e.target.value
                                  )
                                }
                                className="text-body2 bg-transparent text-gray-5 focus:outline-none w-full"
                              />
                            ) : (
                              <span>{option}</span>
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

        {/* 오른쪽 세부정보 패널 */}
        <aside className="w-53 flex flex-col mt-53 gap-4">
          <div className="w-full p-4 flex flex-col items-center border border-primary-light rounded-lg">
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
