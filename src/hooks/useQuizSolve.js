// src/hooks/useQuizSolve.js
import { useState, useEffect } from "react";
// import { getQuizForSolving } from "@/apis/api";

// --- 더미 데이터 ---
const dummyQuestions = [
  {
    id: "q1",
    title: "Q1 어쩌고 저쩌고",
    options: [
      "가나다라",
      "가나다라마바사아자차카타파하가나다라",
      "가나다라",
      "가나다라",
    ],
  },
  {
    id: "q2",
    title: "Q2 어쩌고 저쩌고",
    options: [
      "가나다라",
      "가나다라마바사아자차카타파하가나다라",
      "가나다라",
      "가나다라",
    ],
  },
];
// -----------------

/*
// ▼▼▼ 백엔드 연동 시 사용할 실제 훅 ▼▼▼
export function useQuizSolve(quizId) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // 실제 API 호출 (URL 파라미터는 quizId를 사용한다고 가정)
        const result = await getQuizForSolving(quizId);
        setQuestions(result.questions);
      } catch (err) {
        setError("퀴즈를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  return { questions, loading, error };
}
*/

// ▼▼▼ 현재 사용할 더미 데이터용 훅 ▼▼▼
export function useQuizSolve(quizId) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setQuestions(dummyQuestions);
      setLoading(false);
    }, 500);
  }, [quizId]);

  return { questions, loading, error };
}
