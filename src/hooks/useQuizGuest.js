// src/hooks/useQuizGuest.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getUUIDType,
  getQuizGuest,
  postQuizGuestName,
  postQuizGuestSubmit,
  getQuizGuestSubmit,
} from "@/apis/api";

export default function useQuizGuest(uuid) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 타입
  const [type, setType] = useState(null); // 1|2|3
  const [shareType, setShareType] = useState(null); // "chem"|"chemi"|"some"|"mbti"
  const slugToType = useMemo(
    () => ({ chem: 1, chemi: 1, some: 2, mbti: 3 }),
    []
  );

  // 문제
  const [questions, setQuestions] = useState([]);

  // 게스트 세션
  const [qpId, setQpId] = useState(null);
  const [started, setStarted] = useState(false);
  const [startLoading, setStartLoading] = useState(false);

  // 제출/결과
  const [submitting, setSubmitting] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [details, setDetails] = useState({});
  const [sections, setSections] = useState([]);
  const [owner, setOwner] = useState({});

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── 타입 확보(숫자/슬러그 동시 세팅). 의존성: uuid만!
  const ensureType = useCallback(async () => {
    if (!uuid) throw new Error("유효하지 않은 공유 링크입니다.");
    const slug = await getUUIDType(uuid); // "chem" | "chemi" | "some" | "mbti"
    const t = slugToType[slug];
    if (!t) {
      console.error("[useQuizGuest] Unknown slug:", slug);
      throw new Error("알 수 없는 퀴즈 타입입니다.");
    }
    if (mountedRef.current) {
      setShareType(slug);
      setType(t);
    }
    return { shareType: slug, type: t };
  }, [uuid, slugToType]);

  // ── 문제 정규화
  const normalizeQuestions = useCallback((payload) => {
    const arr = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.questions)
      ? payload.questions
      : [];
    return arr.map((q, idx) => ({
      id: q?.question_id ?? q?.id ?? idx,
      title: q?.question ?? q?.title ?? "",
      options: [
        q?.choice1 ?? "",
        q?.choice2 ?? "",
        q?.choice3 ?? "",
        q?.choice4 ?? "",
      ],
    }));
  }, []);

  // ── 문제 로드
  const refetchQuestions = useCallback(async () => {
    if (!uuid) return;
    setLoading(true);
    setError(null);
    try {
      const { type: t } = await ensureType();
      const data = await getQuizGuest(t, uuid); // t는 숫자형(1|2|3)
      const qs = normalizeQuestions(data);
      if (!mountedRef.current) return;
      setQuestions(qs);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || "퀴즈를 불러오지 못했습니다.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [uuid, ensureType, normalizeQuestions]);

  // ── 최초/uuid 변경 시 한 번만 로드
  useEffect(() => {
    setQuestions([]);
    setQpId(null);
    setStarted(false);
    setOwner({});
    setDetails({});
    setSections([]);
    setError(null);
    setShareType(null);
    setType(null);

    if (!uuid) return;
    (async () => {
      await refetchQuestions();
    })();
  }, [uuid]); // refetchQuestions를 의존성에 넣지 않음(무한루프 방지)

  // ── 게스트 이름 등록
  const startGuest = useCallback(
    async (n) => {
      const nameToUse = n?.trim();
      if (!nameToUse) throw new Error("이름을 입력해 주세요.");
      if (!uuid) throw new Error("유효하지 않은 공유 링크입니다.");
      setStartLoading(true);
      setError(null);
      try {
        const { type: t } = await ensureType();
        const res = await postQuizGuestName(t, uuid, nameToUse);
        const id =
          res?.QP_id ?? res?.qp_id ?? res?.id ?? res?.participant_id ?? null;
        if (!id) throw new Error("게스트 세션을 생성하지 못했습니다.");
        if (!mountedRef.current) return null;
        setQpId(id);
        setStarted(true);
        return id;
      } catch (e) {
        if (mountedRef.current)
          setError(e?.message || "이름 등록에 실패했습니다.");
        return null;
      } finally {
        if (mountedRef.current) setStartLoading(false);
      }
    },
    [uuid, ensureType]
  );

  // ── 개인 결과만 단독 조회 (answer 페이지에서 사용)
  const fetchMyPersonalResult = useCallback(
    async (qp) => {
      const effectiveQp = qp ?? qpId;
      if (!uuid) throw new Error("유효하지 않은 공유 링크입니다.");
      if (!effectiveQp) throw new Error("결과 식별자가 없습니다. (qpId 누락)");

      setResultLoading(true);
      setError(null);
      try {
        const { type: t } = await ensureType();
        const res = await getQuizGuestSubmit(t, uuid, effectiveQp);

        const r = res?.result ?? res?.details ?? {};
        const det = {
          relationship: r?.relationship ?? "-",
          situation: r?.situation ?? "-",
          period:
            r?.analysis_date_start && r?.analysis_date_end
              ? `${r.analysis_date_start} ~ ${r.analysis_date_end}`
              : "-",
        };
        const own = {
          name: res?.owner?.name ?? res?.name ?? "-",
          score:
            typeof res?.owner?.score === "number"
              ? res.owner.score
              : typeof res?.score === "number"
              ? res.score
              : 0,
        };
        const makeQuestion = (q, idx) => ({
          id: q?.question_id ?? q?.id ?? idx,
          title: q?.question ?? q?.title ?? "",
          options: [
            q?.choice1 ?? "",
            q?.choice2 ?? "",
            q?.choice3 ?? "",
            q?.choice4 ?? "",
          ],
          correctOptionIndex:
            typeof q?.answer === "number"
              ? q.answer - 1
              : q?.correctIndex ?? -1,
          userSelectedOptionIndex:
            typeof q?.selected === "number"
              ? q.selected - 1
              : typeof q?.my_choice === "number"
              ? q.my_choice - 1
              : -1,
        });
        const rawQs = Array.isArray(res?.questions)
          ? res.questions
          : Array.isArray(res?.data)
          ? res.data
          : [];
        const sec = [
          {
            sectionTitle: "내 정답 결과",
            questions: rawQs.map(makeQuestion),
          },
        ];

        if (!mountedRef.current) return;
        setQpId(effectiveQp);
        setDetails(det);
        setOwner(own);
        setSections(sec);
      } catch (e) {
        if (mountedRef.current)
          setError(e?.message || "개인 결과를 불러오지 못했습니다.");
      } finally {
        if (mountedRef.current) setResultLoading(false);
      }
    },
    [uuid, qpId, ensureType]
  );

  // ── 제출 + 개인결과 연계 조회
  const submitGuest = useCallback(
    async (answersMap) => {
      if (!uuid) throw new Error("유효하지 않은 공유 링크입니다.");
      if (!qpId)
        throw new Error("게스트 세션이 없습니다. 먼저 이름을 등록하세요.");

      // 1) 정답 배열 구성: 서버가 내려준 문제 순서대로, 0-based → 1-based
      const data = (questions ?? []).map((q) => {
        const sel = answersMap?.[q.id];
        if (!Number.isInteger(sel))
          throw new Error("모든 문항에 응답해 주세요.");
        return { answer: sel + 1 }; // 1~4
      });

      setSubmitting(true);
      setError(null);

      try {
        const { type: t } = await ensureType();
        await postQuizGuestSubmit(t, uuid, qpId, data);
      } catch (e) {
        if (mountedRef.current) setError(e?.message || "제출에 실패했습니다.");
        if (mountedRef.current) setSubmitting(false);
        return;
      }

      // 2) 제출 성공 후, 개인 결과 로드
      setSubmitting(false);
      await fetchMyPersonalResult(qpId);
    },
    [uuid, qpId, questions, ensureType, fetchMyPersonalResult]
  );

  return {
    // 상태
    loading,
    error,

    // 타입
    type, // 1|2|3
    shareType, // "chem" | "chemi" | "some" | "mbti"

    // 문제(풀이)
    questions,
    refetchQuestions,

    // 게스트 시작(이름 등록)
    qpId,
    started,
    startLoading,
    startGuest,

    // 제출 + 개인결과
    submitting,
    submitGuest,
    resultLoading,
    details,
    sections,
    owner,

    // 개인결과 단독 조회(정답 페이지에서 사용)
    fetchMyPersonalResult,
  };
}
