// src/hooks/useQuizGuest.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getUUIDType,
  getQuizGuest,
  postQuizGuestName,
  postQuizGuestSubmit,
  getQuizGuestSubmit,
  getChemiGuestDetail,
  getSomeGuestDetail,
  getMbtiGuestDetail,
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

  const [resultData, setResultData] = useState({});
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

  // ── 타입 확보
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

  // ───────── 타입별 분석 상세 → resultData 세팅 ─────────
  useEffect(() => {
    if (!uuid || !type) return;
    let alive = true;

    (async () => {
      try {
        let detail;
        if (type === 1) {
          detail = await getChemiGuestDetail(uuid);
        } else if (type === 2) {
          detail = await getSomeGuestDetail(uuid);
        } else if (type === 3) {
          detail = await getMbtiGuestDetail(uuid);
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
  }, [uuid, type]);

  // ── 문제 정규화 (questionIndex는 1-based로 유지)
  const normalizeQuestions = useCallback((payload) => {
    const arr = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.questions)
      ? payload.questions
      : [];
    return arr.map((q, idx) => ({
      id: q?.question_index + 1, // UI에서 선택 키로 사용
      questionIndex: q?.question_index,
      title: q?.question ?? "",
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
      // 응답 배열 형태:
      // [{ question_index(0~), question(string), choice~ }, ...]
      const data = await getQuizGuest(t, uuid); // t는 숫자형(1|2|3)
      console.log("getQuizGuest: ", data);
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
  }, [uuid]); // refetchQuestions 의존성 제외(무한루프 방지)

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

        // 아직 문제를 못 받았으면 먼저 가져옴(결과-문항 매칭 필요)
        if ((questions ?? []).length === 0) {
          await refetchQuestions();
        }

        // 응답 배열 형태:
        // [{ QPD_id, response(1~4), result(bool), answer(1~4), QP, question(1~N) }, ...]
        const arr = await getQuizGuestSubmit(t, uuid, effectiveQp);
        console.log("arr: ", arr);

        // question(1-based) → 응답 객체 맵
        const byQuestionNumber = new Map(
          (Array.isArray(arr) ? arr : []).map((r) => [Number(r.question), r])
        );

        const builtQuestions = (questions ?? []).map((q, idx) => {
          const qNum =
            (typeof q.questionIndex === "number" && q.questionIndex) || idx; // 1-based fallback
          const r = byQuestionNumber.get(Number(qNum + 1));

          const selected = Number.isFinite(r?.response)
            ? Number(r.response) - 1
            : -1; // 0-based
          const correctIdx = Number.isFinite(r?.answer)
            ? Number(r.answer) - 1
            : -1; // 0-based

          return {
            id: q.id,
            title: q.title ?? "",
            options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
            userSelectedOptionIndex: selected,
            correctOptionIndex: correctIdx, // 이제 항상 정답 하이라이트 가능
          };
        });

        // 점수(정답 개수 비율)
        const total = (Array.isArray(arr) ? arr.length : 0) || 0;
        const correct = (Array.isArray(arr) ? arr : []).filter(
          (r) => r?.result === true
        ).length;
        const score = total ? Math.round((correct / total) * 100) : 0;

        if (!mountedRef.current) return;
        setQpId(effectiveQp);
        setDetails({ relationship: "-", situation: "-", period: "-" }); // 메타가 없으므로 기본값
        setOwner((prev) => ({
          name: prev?.name ?? "-", // 이름을 따로 안 주면 기본값
          score,
        }));
        setSections([
          { sectionTitle: "내 정답 결과", questions: builtQuestions },
        ]);
      } catch (e) {
        if (mountedRef.current)
          setError(e?.message || "개인 결과를 불러오지 못했습니다.");
      } finally {
        if (mountedRef.current) setResultLoading(false);
      }
    },
    [uuid, qpId, ensureType, questions, refetchQuestions]
  );

  // ── 제출 + 개인결과 연계 조회
  const submitGuest = useCallback(
    async (answersMap) => {
      if (!uuid) throw new Error("유효하지 않은 공유 링크입니다.");
      if (!qpId)
        throw new Error("게스트 세션이 없습니다. 먼저 이름을 등록하세요.");

      // 1) 정답 배열 구성: 서버가 내려준 문제 순서대로, 1-based
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
    resultData,

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
