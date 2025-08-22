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
  getUUIDType,
} from "@/apis/api";

const slugToType = (slug) =>
  slug === "chem" ? 1 : slug === "some" ? 2 : slug === "mbti" ? 3 : null;

export default function useQuizData(resultId, uuid) {
  const [overview, setOverview] = useState(null);
  const [questionsRaw, setQuestionsRaw] = useState([]); // 원본 questions
  const [scores, setScores] = useState([]); // [{ QP_id, name, score }]
  const [personalDetails, setPersonalDetails] = useState([]); // [{ response, result, QP, question }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 공유 정보
  const [shareType, setShareType] = useState(null); // "chem" | "some" | "mbti" | null
  const [typeNum, setTypeNum] = useState(null); // 1 | 2 | 3 | null

  // ───────── 타입 결정: uuid → type ─────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        // uuid가 없으면 에러
        if (!uuid) throw new Error("공유 링크 정보(uuid)가 없습니다.");
        const slug = await getUUIDType(uuid); // "chem" | "some" | "mbti"
        const num = slugToType(slug);
        if (!num) throw new Error("지원하지 않는 퀴즈 타입입니다.");
        if (!alive) return;
        setShareType(slug);
        setTypeNum(num);
      } catch (e) {
        if (!alive) return;
        setError(e?.message ?? "타입 확인에 실패했습니다.");
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uuid]);

  // 문제 normalize
  const normalizeQuestions = useCallback((arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((q) => ({
      questionId: q.question_id,
      questionIndex: q.question_index, // 수정/삭제 시 path param에 사용
      title: q.question,
      options: [q.choice1, q.choice2, q.choice3, q.choice4],
      answer: q.answer, // 1~4
      counts: [q.count1, q.count2, q.count3, q.count4],
      correctNum: q.correct_num,
    }));
  }, []);

  // 초기 로드 (type이 정해진 뒤에만 실행)
  const refetch = useCallback(async () => {
    if (!resultId || !typeNum) return;
    setLoading(true);
    setError(null);
    try {
      const [ov, detail, resultList] = await Promise.all([
        getQuiz(typeNum, resultId),
        getQuizDetail(typeNum, resultId),
        getQuizResult(typeNum, resultId),
      ]);
      setOverview(ov ?? null);
      setQuestionsRaw(normalizeQuestions(detail ?? []));
      setScores(Array.isArray(resultList) ? resultList : []);
    } catch (e) {
      setError(e?.message ?? "퀴즈 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [typeNum, resultId, normalizeQuestions]);

  useEffect(() => {
    // 타입이 확정된 이후에만 fetch
    if (typeNum) refetch();
  }, [typeNum, refetch]);

  // 사람별 상세 조회(한 명)
  const fetchPersonal = useCallback(
    async (QP_id) => {
      if (!resultId || !typeNum || !QP_id) return;
      try {
        const arr = await getQuizResultPersonal(typeNum, resultId, QP_id);
        setPersonalDetails((prev) => [
          ...prev.filter((d) => d.QP !== QP_id),
          ...(Array.isArray(arr) ? arr : []),
        ]);
      } catch (e) {
        console.error("개인 상세 조회 실패:", e);
      }
    },
    [typeNum, resultId]
  );

  // 개인 기록 삭제
  const removePersonal = useCallback(
    async (QP_id) => {
      if (!resultId || !typeNum || !QP_id) return;
      await deleteQuizResultPersonal(typeNum, resultId, QP_id);
      setScores((prev) => prev.filter((s) => s.QP_id !== QP_id));
      setPersonalDetails((prev) => prev.filter((d) => d.QP !== QP_id));
    },
    [typeNum, resultId]
  );

  // 문제 + 맞힌 사람 이름 결합
  const questions = useMemo(() => {
    if (!questionsRaw.length) return [];
    return questionsRaw.map((q) => {
      const correctPeople = personalDetails
        .filter((d) => d.question === q.questionId && d.result === true)
        .map((d) => {
          const person = scores.find((s) => s.QP_id === d.QP);
          return person?.name ?? "(이름 없음)";
        });
      return { ...q, correctNames: correctPeople };
    });
  }, [questionsRaw, personalDetails, scores]);

  // ─────────────── 액션들 (생성/수정/삭제) ───────────────

  // 1개 추가
  const addOne = useCallback(async () => {
    if (!resultId || !typeNum) return;
    await postQuiz1(typeNum, resultId);
    await refetch();
  }, [typeNum, resultId, refetch]);

  // UI → API payload 변환기
  const toUpdatePayload = useCallback(
    (q) => ({
      question: q.title ?? "",
      choice1: q.options?.[0] ?? "",
      choice2: q.options?.[1] ?? "",
      choice3: q.options?.[2] ?? "",
      choice4: q.options?.[3] ?? "",
      answer: q.answer, // 1~4
    }),
    []
  );

  // 문제 수정
  const updateOne = useCallback(
    async (questionIndex, uiModel) => {
      if (!resultId || !typeNum) return;
      await putQuiz(typeNum, resultId, questionIndex, toUpdatePayload(uiModel));
      await refetch();
    },
    [typeNum, resultId, toUpdatePayload, refetch]
  );

  // 문제 삭제 (단일)
  const deleteOne = useCallback(
    async (questionIndex) => {
      if (!resultId || !typeNum) return;
      await deleteQuiz1(typeNum, resultId, questionIndex);
      await refetch();
    },
    [typeNum, resultId, refetch]
  );

  // 전체 삭제
  const deleteAll = useCallback(async () => {
    if (!resultId || !typeNum) return;
    await deleteQuiz10(typeNum, resultId);
    setOverview(null);
    setQuestionsRaw([]);
    setScores([]);
    setPersonalDetails([]);
  }, [typeNum, resultId]);

  return {
    // 데이터
    overview,
    questions, // correctNames 포함
    loading,
    error,

    // 타입 정보 (uuid는 반환 X)
    type: typeNum, // 1 | 2 | 3
    shareType, // "chem" | "some" | "mbti"

    // 조회
    refetch,
    scores,
    fetchPersonal,
    removePersonal,

    // 액션
    addOne, // 1개 추가
    updateOne, // 문제 수정
    deleteOne, // 문제 삭제(단일)
    deleteAll, // 전체 삭제
    toUpdatePayload, // UI→API 변환 헬퍼
  };
}
