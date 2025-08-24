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

  // ── 문제 정규화 (아주 단순하게: 화면 순서 = 1..N, id는 idx+1)
  const normalizeQuestions = useCallback((payload) => {
    const arr = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.questions)
      ? payload.questions
      : [];
    return arr.map((q, idx) => ({
      id: idx + 1, // UI key & 제출용 key
      title: q?.question ?? "",
      options: [
        q?.choice1 ?? "",
        q?.choice2 ?? "",
        q?.choice3 ?? "",
        q?.choice4 ?? "",
      ],
      // 디버깅용으로 서버가 주는 index/identifier를 보존(매칭 안 써도 되지만 로그에 도움)
      __serverIndex: q?.question_index, // 0-based일 가능성
      __serverId: q?.question_id, // 있으면 참고용
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
      const qs = normalizeQuestions(data);
      if (!mountedRef.current) return;
      setQuestions(qs);
      return qs;
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

  const fetchMyPersonalResult = useCallback(
    async (qp) => {
      const effectiveQp = qp ?? qpId;
      if (!uuid) throw new Error("유효하지 않은 공유 링크입니다.");
      if (!effectiveQp) throw new Error("결과 식별자가 없습니다. (qpId 누락)");

      setResultLoading(true);
      setError(null);
      try {
        const { type: t } = await ensureType();

        // 1) 질문 배열 확보(상태가 비어 있으면 refetchQuestions()의 반환값 사용)
        let qList = questions;
        if (!Array.isArray(qList) || qList.length === 0) {
          qList = (await refetchQuestions()) ?? [];
        }

        // 서버 제출 결과: [{ response(1~4), result(bool), answer(1~4), question(?, 1~N일 수도, id일 수도), question_index(0~?) }, ...]
        const raw = await getQuizGuestSubmit(t, uuid, effectiveQp);
        const arr = Array.isArray(raw) ? raw : [];

        // (1) 제출 결과 정렬 키: question_index → question → 배열 순번
        const keyOf = (r, i) =>
          Number.isFinite(r?.question_index)
            ? Number(r.question_index) // 0-based로 가정
            : Number.isFinite(r?.question)
            ? Number(r.question) - 1 // 1-based로 가정
            : i; // 최후의 fallback

        const sortedSubmits = [...arr].sort(
          (a, b) => keyOf(a, 0) - keyOf(b, 0)
        );

        // (2) 길이 체크 & 로그
        if (sortedSubmits.length !== (qList?.length ?? 0)) {
          console.warn("[useQuizGuest] 제출결과 개수와 문제 수가 다릅니다.", {
            submits: sortedSubmits.length,
            questions: qList?.length,
            sortedSubmits,
            questions: qList,
          });
        }

        // (3) 정렬된 제출 결과와 현재 문제 배열을 zip
        const N = Math.min(sortedSubmits.length, qList.length);
        const builtQuestions = qList.map((q, idx) => {
          const r = idx < N ? sortedSubmits[idx] : null;
          const selected = Number.isFinite(r?.response)
            ? Number(r.response) - 1
            : -1; // 0-based
          const correct = Number.isFinite(r?.answer)
            ? Number(r.answer) - 1
            : -1; // 0-based

          if (r == null) {
            console.warn(
              "[useQuizGuest] 해당 문항에 매칭되는 제출 결과가 없습니다.",
              { idx, q }
            );
          }

          return {
            id: q.id,
            title: q.title ?? "",
            options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
            userSelectedOptionIndex: selected,
            correctOptionIndex: correct,
          };
        });

        // 점수(정답 개수 비율)
        const total = sortedSubmits.length;
        const correctCount = sortedSubmits.filter(
          (r) => r?.result === true
        ).length;
        const score = total ? Math.round((correctCount / total) * 100) : 0;

        if (!mountedRef.current) return;
        setQpId(effectiveQp);
        setDetails({ relationship: "-", situation: "-", period: "-" });
        setOwner((prev) => ({ name: prev?.name ?? "-", score }));
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
