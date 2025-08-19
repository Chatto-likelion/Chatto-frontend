import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components";
import * as Icons from "@/assets/svg";
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";

// --- 페이지에 표시할 더미 데이터 ---
const dummyChatRooms = [
  { id: 1, name: "양재동 족제비", count: 7 },
  { id: 2, name: "양재동 족제비", count: 7 },
  { id: 3, name: "준영이", count: 2 },
];

const dummyQuestions = [
  {
    id: "q1", // 👈 id를 문자열로 변경
    title: "Q1 어쩌고 저쩌고",
    options: [
      "가나다라",
      "가나다라마바사아자차카타파하가나다라",
      "가나다라",
      "가나다라",
    ],
  },
  {
    id: "q2", // 👈 id를 문자열로 변경
    title: "Q2 어쩌고 저쩌고",
    options: [
      "가나다라",
      "가나다라마바사아자차카타파하가나다라",
      "가나다라",
      "가나다라",
    ],
  },
];
// ---------------------------------

export default function QuizPage() {
  const [chatRooms] = useState(dummyChatRooms);
  const [questions] = useState(dummyQuestions);
  const [answers, setAnswers] = useState({});
  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prevAnswers) => {
      if (prevAnswers[questionId] === optionIndex) {
        const newAnswers = { ...prevAnswers };
        delete newAnswers[questionId];
        return newAnswers;
      }
      return {
        ...prevAnswers,
        [questionId]: optionIndex,
      };
    });
  };

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
                className="bg-primary-dark border border-primary-light rounded w-[190px] h-[32px] pl-3 text-body2 w-48"
              />
            </div>
            <button className="text-button border border-gray-2 rounded w-[110px] h-[32px] ml-3 hover:bg-primary-light hover:text-primary-dark">
              결과 제출하기
            </button>
            <button className="text-button border border-secondary text-secondary rounded w-[110px] h-[32px] hover:bg-secondary-light hover:text-primary-dark">
              나도 분석하기
            </button>
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
    </div>
  );
}
