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
  getChemiAnalysisDetail,
  getSomeAnalysisDetail,
  getMbtiAnalysisDetail,
  postCreditUsage,
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

  const [resultData, setResultData] = useState({});

  // 공유 정보
  const [shareType, setShareType] = useState(null); // "chem" | "some" | "mbti" | null
  const [typeNum, setTypeNum] = useState(null); // 1 | 2 | 3 | null

  // ───────── 타입 결정: uuid → type ─────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
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

  // ───────── 타입별 분석 상세 → resultData 세팅 ─────────
  useEffect(() => {
    if (!resultId || !typeNum) return;
    let alive = true;

    (async () => {
      try {
        let detail;
        if (typeNum === 1) {
          detail = await getChemiAnalysisDetail(resultId);
        } else if (typeNum === 2) {
          detail = await getSomeAnalysisDetail(resultId);
        } else if (typeNum === 3) {
          detail = await getMbtiAnalysisDetail(resultId);
        }

        if (!alive) return;
        const r = detail?.result ?? detail ?? {};
        setResultData(r);
      } catch (e) {
        console.error("분석 상세 조회 실패:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [resultId, typeNum]);

  // QP_id -> { name, score } (문자열 키!)
  const participantIndex = useMemo(() => {
    const m = new Map();
    for (const s of scores)
      m.set(String(s.QP_id), { name: s.name, score: s.score });
    return m;
  }, [scores]);

  // 🔽 ADD: 질문별(문항별) "선지 -> 이름 배열" 맵
  // Map<questionId, [string[], string[], string[], string[]]>
  const selectionsByQuestion = useMemo(() => {
    if (!questionsRaw.length || !personalDetails.length) return new Map();
    const map = new Map();
    for (const q of questionsRaw) map.set(q.questionId, [[], [], [], []]);

    for (const d of personalDetails) {
      const arr = map.get(d.question);
      if (!arr) continue;
      const idx = (Number(d.response) || 0) - 1;
      if (idx >= 0 && idx < 4) {
        const info = participantIndex.get(String(d.QP)); // ◀︎ 여기!
        arr[idx].push(info?.name ?? "(이름 없음)");
      }
    }
    return map;
  }, [questionsRaw, personalDetails, participantIndex]);

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
    if (typeNum) refetch();
  }, [typeNum, refetch]);

  // 사람별 상세 조회(한 명)
  const fetchPersonal = useCallback(
    async (QP_id) => {
      if (!resultId || !typeNum || !QP_id) return;
      try {
        const arr = await getQuizResultPersonal(typeNum, resultId, QP_id);

        // ◀︎ 정규화: QP는 문자열, question은 그대로 보존(필요시 여기서도 정규화)
        const norm = (Array.isArray(arr) ? arr : []).map((d) => ({
          ...d,
          QP: String(d.QP),
        }));
        const keyOf = (d) => `${d.QP}-${d.question}`;

        setPersonalDetails((prev) => {
          // 이전 것 중 동일 QP는 제거 (▶︎ 문자열로 비교)
          const filtered = prev.filter((d) => String(d.QP) !== String(QP_id));

          // 새로 들어온 것 내부 중복 제거
          const seen = new Set();
          const uniqueNorm = norm.filter((d) => {
            const k = keyOf(d);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });

          // 최종 병합 후, 혹시 전체 중복도 한 번 더 제거
          const merged = [...filtered, ...uniqueNorm];
          const seenAll = new Set();
          return merged.filter((d) => {
            const k = keyOf(d);
            if (seenAll.has(k)) return false;
            seenAll.add(k);
            return true;
          });
        });
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
      const chosenNamesByOption = selectionsByQuestion.get(q.questionId) ?? [
        [],
        [],
        [],
        [],
      ];
      return { ...q, correctNames: correctPeople, chosenNamesByOption };
    });
  }, [questionsRaw, personalDetails, scores, selectionsByQuestion]);

  // 🔽 ADD: 헬퍼 - 특정 문항/선지(1~4)를 고른 사람 이름 배열 반환
  const getOptionTakers = useCallback(
    (questionId, optionNum) => {
      const arr = selectionsByQuestion.get(questionId);
      if (!arr) return [];
      const idx = (optionNum ?? 0) - 1;
      return idx >= 0 && idx < 4 ? arr[idx] : [];
    },
    [selectionsByQuestion]
  );

  // 🔽 ADD: 헬퍼 - 모든 참가자 개인 상세를 한 번에 로드(옵션)
  const fetchAllPersonal = useCallback(async () => {
    if (!resultId || !typeNum || !scores?.length) return;
    try {
      const all = await Promise.all(
        scores.map((s) =>
          getQuizResultPersonal(typeNum, resultId, s.QP_id).catch(() => [])
        )
      );
      // 평탄화 + 중복 제거(QP, question 기준)
      const flat = all.flat();
      const key = (d) => `${d.QP}-${d.question}`;
      const uniq = [];
      const seen = new Set();
      for (const d of flat) {
        const k = key(d);
        if (!seen.has(k)) {
          seen.add(k);
          uniq.push(d);
        }
      }
      setPersonalDetails(uniq);
    } catch (e) {
      console.error("fetchAllPersonal 실패:", e);
    }
  }, [scores, typeNum, resultId]);

  // ─────────────── 액션들 (생성/수정/삭제) ───────────────

  const addOne = useCallback(async () => {
    if (!resultId || !typeNum) return;
    await postCreditUsage({
      amount: 1,
      usage: `Play ${
        typeNum == 3 ? "MBTI" : typeNum == 2 ? "썸" : "케미"
      } 퀴즈`,
      purpose: "퀴즈 문항 추가",
    });
    await postQuiz1(typeNum, resultId);
    await refetch();
  }, [typeNum, resultId, refetch]);

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

  const updateOne = useCallback(
    async (questionIndex, uiModel) => {
      if (!resultId || !typeNum) return;
      await putQuiz(typeNum, resultId, questionIndex, toUpdatePayload(uiModel));
      await refetch();
    },
    [typeNum, resultId, toUpdatePayload, refetch]
  );

  const deleteOne = useCallback(
    async (questionIndex) => {
      if (!resultId || !typeNum) return;
      await deleteQuiz1(typeNum, resultId, questionIndex);
      await refetch();
    },
    [typeNum, resultId, refetch]
  );

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
    resultData,

    // 타입 정보
    type: typeNum, // 1 | 2 | 3
    shareType, // "chem" | "some" | "mbti"

    // 조회
    refetch,
    scores, // ← 이름/점수 매칭된 배열
    personalDetails,
    fetchPersonal,
    removePersonal,
    getOptionTakers, // ← (questionId, optionNum) → 이름 배열
    fetchAllPersonal, // ← 모든 개인 상세 한 번에 로드(선택)

    // 액션
    addOne,
    updateOne,
    deleteOne,
    deleteAll,
    toUpdatePayload,
  };
}
