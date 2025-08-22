// src/hooks/useQuiz.jsx
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  getQuiz,
  getQuizDetail,
  postQuiz1,
  putQuiz,
  deleteQuiz1,
  deleteQuiz10,
  getQuizResult,
  getQuizResultPersonal,
  deleteQuizResultPersonal,
} from "@/apis/api";

export function useQuiz(type, resultId) {
  const [overview, setOverview] = useState(null);
  const [questionsRaw, setQuestionsRaw] = useState([]); // 원본 questions
  const [scores, setScores] = useState([]); // [{ QP_id, name, score }]
  const [personalDetails, setPersonalDetails] = useState([]); // [{ response, result, QP, question }]

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredDeleteId, setHoveredDeleteId] = useState(null);

  // 문제 normalize
  const normalizeQuestions = useCallback((arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((q) => ({
      questionId: q.question_id,
      questionIndex: q.question_index,
      title: q.question,
      options: [q.choice1, q.choice2, q.choice3, q.choice4],
      answer: q.answer,
      counts: [q.count1, q.count2, q.count3, q.count4],
      correctNum: q.correct_num,
    }));
  }, []);

  // 초기 로드
  const refetch = useCallback(async () => {
    if (!resultId) return;
    setLoading(true);
    setError(null);
    try {
      const [ov, detail, resultList] = await Promise.all([
        getQuiz(type, resultId),
        getQuizDetail(type, resultId),
        getQuizResult(type, resultId), // 점수 목록도 같이
      ]);
      setOverview(ov ?? null);
      setQuestionsRaw(normalizeQuestions(detail ?? []));
      setScores(Array.isArray(resultList) ? resultList : []);
    } catch (e) {
      setError(e?.message ?? "퀴즈 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [type, resultId, normalizeQuestions]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // 사람별 상세 조회
  const fetchPersonal = useCallback(
    async (QP_id) => {
      if (!resultId || !QP_id) return;
      try {
        const arr = await getQuizResultPersonal(type, resultId, QP_id);
        setPersonalDetails((prev) => [
          ...prev.filter((d) => d.QP !== QP_id),
          ...(Array.isArray(arr) ? arr : []),
        ]);
      } catch (e) {
        console.error("개인 상세 조회 실패:", e);
      }
    },
    [type, resultId]
  );

  // 개인 기록 삭제
  const removePersonal = useCallback(
    async (QP_id) => {
      if (!resultId || !QP_id) return;
      await deleteQuizResultPersonal(type, resultId, QP_id);
      setScores((prev) => prev.filter((s) => s.QP_id !== QP_id));
      setPersonalDetails((prev) => prev.filter((d) => d.QP !== QP_id));
    },
    [type, resultId]
  );

  // === 여기서 questions + 맞힌 사람 이름들 결합 ===
  const questions = useMemo(() => {
    if (!questionsRaw.length) return [];

    return questionsRaw.map((q) => {
      // 이 문제(questionIndex)를 맞힌 사람 찾기
      const correctPeople = personalDetails
        .filter(
          (d) =>
            d.question === q.questionId && // 문제 id 매칭
            d.result === true // 맞힌 경우만
        )
        .map((d) => {
          const person = scores.find((s) => s.QP_id === d.QP);
          return person?.name ?? "(이름 없음)";
        });

      return {
        ...q,
        correctNames: correctPeople, // 새 필드 추가
      };
    });
  }, [questionsRaw, personalDetails, scores]);

  return {
    overview,
    questions, // 이제 correctNames 포함
    loading,
    error,
    refetch,
    scores,
    fetchPersonal,
    removePersonal,
  };
}
