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
  postUUID,
  getUUIDType,
} from "@/apis/api";

export default function useQuizData(type, resultId) {
  const [overview, setOverview] = useState(null);
  const [questionsRaw, setQuestionsRaw] = useState([]); // 원본 questions
  const [scores, setScores] = useState([]); // [{ QP_id, name, score }]
  const [personalDetails, setPersonalDetails] = useState([]); // [{ response, result, QP, question }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 공유용 uuid / type(slug)
  const [shareUUID, setShareUUID] = useState(null); // string|null
  const [shareType, setShareType] = useState(null); // "chem"|"some"|"mbti"|null

  const typeToSlug = (t) =>
    t === 1 ? "chem" : t === 2 ? "some" : t === 3 ? "mbti" : null;

  // 문제 normalize
  const normalizeQuestions = useCallback((arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((q) => ({
      questionId: q.question_id,
      questionIndex: q.question_index, // ← 수정/삭제 시 path param에 사용
      title: q.question,
      options: [q.choice1, q.choice2, q.choice3, q.choice4],
      answer: q.answer, // 1~4
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
        getQuizResult(type, resultId), // 사람별 점수 목록
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

  // uuid 확보 로직: overview 로드 이후 수행
  useEffect(() => {
    let alive = true;
    const ensureUUID = async () => {
      if (!resultId) return;

      // 1) overview에 기존 uuid가 있으면 사용
      const existing = overview?.result?.uuid ?? overview?.uuid ?? null;

      try {
        if (existing) {
          if (!alive) return;
          setShareUUID(existing);
          // 타입 조회
          try {
            const t = await getUUIDType(existing);
            if (alive) setShareType(t ?? null);
          } catch {
            // 조회 실패해도 치명적 아님
          }
          return;
        }

        // 2) 없으면 생성
        const newUuid = await postUUID(type, resultId);
        if (!alive) return;
        setShareUUID(newUuid || null);
        // 생성한 경우는 우리가 type을 알고 있으므로 즉시 슬러그 세팅
        const slug = typeToSlug(type);
        if (slug) setShareType(slug);

        // 필요하면 확인차 getUUIDType(newUuid)도 가능하지만 네트워크 절약을 위해 생략
      } catch (e) {
        // uuid 생성/조회 실패는 공유 기능에만 영향. 훅 전체 에러로 올리지 않음.
        // 필요시 별도 상태를 두고 처리 가능
      }
    };

    // overview fetch가 끝난 뒤 시도
    if (overview !== null) {
      ensureUUID();
    }

    return () => {
      alive = false;
    };
  }, [overview, resultId, type]);

  // 사람별 상세 조회(한 명)
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
    if (!resultId) return;
    await postQuiz1(type, resultId);
    await refetch();
  }, [type, resultId, refetch]);

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
      if (!resultId) return;
      await putQuiz(type, resultId, questionIndex, toUpdatePayload(uiModel));
      await refetch();
    },
    [type, resultId, toUpdatePayload, refetch]
  );

  // 문제 삭제 (단일)
  const deleteOne = useCallback(
    async (questionIndex) => {
      if (!resultId) return;
      await deleteQuiz1(type, resultId, questionIndex);
      await refetch();
    },
    [type, resultId, refetch]
  );

  // 전체 삭제
  const deleteAll = useCallback(async () => {
    if (!resultId) return;
    await deleteQuiz10(type, resultId);
    setOverview(null);
    setQuestionsRaw([]);
    setScores([]);
    setPersonalDetails([]);
    // 공유 uuid는 서버에 남겠지만, 화면에선 비워둘 수 있음
    setShareUUID(null);
    setShareType(null);
  }, [type, resultId]);

  return {
    // 데이터
    overview,
    questions, // correctNames 포함
    loading,
    error,

    // 공유(추가됨)
    shareUUID, // 최종 uuid 문자열(없으면 null)
    shareType, // "chem" | "some" | "mbti" | null

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
