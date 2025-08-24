// src/pages/QuizResultPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Header,
  SmallServices,
  DetailForm_Share,
  ShareModal,
} from "@/components";
import CheckBoxIcon from "@/assets/svg/CheckBox.svg?react";
import CheckBoxCheckIcon from "@/assets/svg/CheckBoxCheck.svg?react";
import CheckCircleIcon from "@/assets/svg/CheckCircle.svg?react";
import XCircleIcon from "@/assets/svg/XCircle.svg?react";
import useQuizData from "@/hooks/useQuizData";

export default function QuizResultPage() {
  const { resultId, uuid, qpId } = useParams();
  const navigate = useNavigate();

  const {
    // 공통 데이터
    loading,
    error,
    questions,
    scores,
    type,
    resultData,
    shareType,
    // 개인 상세
    fetchPersonal, // (QP_id) → 개인 응답 로드
    personalDetails, // [{ response(1~4), result(bool), QP, question }]
    fetchAllPersonal, // ★ 전체 참여자 개인 응답 로드
    getOptionTakers, // ★ (questionId, optionNum[1~4]) => string[] (이름 배열)
    // 분석/공유 사이드바에 필요한 기능들
    deleteAll,
  } = useQuizData(resultId, uuid);

  /* ===================== 좌/우 사이드바 공통 ===================== */

  const [modalOpen, setModalOpen] = useState(false);
  const openShareModal = () => setModalOpen(true);
  const closeShareModal = () => setModalOpen(false);

  const shareUrl = useMemo(() => {
    const base = window.location.origin;
    return uuid
      ? `${base}/play/quiz/solve/${uuid}`
      : `${base}/play/quiz/result/${resultId}/${uuid}`;
  }, [resultId, uuid]);

  const [deleting, setDeleting] = useState(false);

  /* ===================== 개인 보기용 데이터 로딩/가공 ===================== */

  // 선택된 참가자 이름
  const me = useMemo(
    () => scores?.find((s) => String(s.QP_id) === String(qpId)),
    [scores, qpId]
  );
  const ownerName = me?.name ?? "-";

  // 페이지 진입/qpId 변경 시: 해당 참가자 개인 상세 로드
  useEffect(() => {
    if (!qpId) return;
    fetchPersonal?.(qpId);
  }, [qpId, fetchPersonal]);

  // 모든 참여자 개인 응답을 미리 로드(툴팁용)
  useEffect(() => {
    // scores가 바뀌면 전체를 갱신해두면, 각 선지 hover시 즉시 이름을 보여줄 수 있음
    fetchAllPersonal?.().catch(() => {});
  }, [scores, fetchAllPersonal]);

  // 내 응답 인덱스 맵 (questionId -> response(1~4))
  const myAnswers = useMemo(() => {
    const m = new Map();
    (personalDetails ?? [])
      .filter((d) => String(d.QP) === String(qpId))
      .forEach((d) => m.set(d.question, d.response));
    return m;
  }, [personalDetails, qpId]);

  const myCorrectCount = useMemo(() => {
    return (personalDetails ?? []).filter(
      (d) => String(d.QP) === String(qpId) && d.result === true
    ).length;
  }, [personalDetails, qpId]);

  // 정답/선지 퍼센트 바 호버(툴팁)
  const [hover, setHover] = useState({ qid: null, opt: null, show: false });

  // 통계 카드
  const stats = useMemo(() => {
    const participantCount = Array.isArray(scores) ? scores.length : 0;
    const questionCount = Array.isArray(questions) ? questions.length : 0;
    const total = (scores ?? []).reduce(
      (sum, s) => sum + (Number(s.score) || 0),
      0
    );
    const averageScore = participantCount
      ? Math.round(total / participantCount)
      : 0;
    return { averageScore, questionCount, participantCount };
  }, [scores, questions]);

  const handleDeleteAll = async () => {
    if (!deleteAll) {
      alert("삭제 기능이 준비되지 않았습니다.");
      return;
    }
    if (
      !window.confirm("정말로 이 퀴즈 전체를 삭제할까요? 복구할 수 없습니다.")
    ) {
      return;
    }

    setDeleting(true);

    navigate(`/play/${type == 1 ? "chemi" : shareType}/${resultId}`);
    deleteAll()
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setDeleting(false));
  };

  if (loading) return <div>결과를 불러오는 중입니다...</div>;
  if (error) return <div className="text-red-500">{String(error)}</div>;

  return (
    <div className="w-full min-h-screen bg-primary-dark text-[#f5f5f5]">
      <Header />
      <div className="w-full max-w-[1400px] mx-auto pt-18 flex justify-center items-start">
        {/* ============ 왼쪽 사이드바 ============ */}
        <aside className="w-[222px] flex-shrink-0 mt-44 mr-10">
          <div className="w-full py-4 px-1 flex flex-col justify-center items-center border border-secondary-light rounded-lg">
            <DetailForm_Share
              type={type}
              value={resultData}
              isAnalysis={true}
            />
            <div className="mt-5">
              <button
                onClick={() =>
                  navigate(
                    `/play/${type == 1 ? "chemi" : shareType}/${resultId}`
                  )
                }
                className="w-30 h-8 hover:bg-secondary hover:text-primary-dark cursor-pointer px-0.25 py-1 text-button border border-secondary rounded-lg"
              >
                분석 보기
              </button>
            </div>
          </div>
        </aside>

        {/* ========================= 가운데: 개인(main) ========================= */}
        <main className="w-[1023px] px-[153px] pb-20 flex flex-col justify-start max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <div className="w-full flex flex-col items-end">
            <h1 className="w-full text-h3 pt-25">Quiz</h1>
            <div className="group flex w-[180px] text-button border-1 border-primary-light rounded-[2px] mt-3 px-[6px] py-1 transition-colors">
              <Link
                to={`/play/quiz/${resultId}/${uuid}`}
                className="flex-1 flex justify-center items-center text-[#595959] whitespace-nowrap pr-[2px]"
              >
                퀴즈 문제 구성
              </Link>
              <div className="border-r border-[#bfbfbf] h-4" />
              <Link
                to={`/play/quiz/result/analysis/${resultId}/${uuid}`}
                className="flex-1 flex justify-center items-center pl-[2px] text-primary-light whitespace-nowrap"
              >
                친구 점수 보기
              </Link>
            </div>
          </div>

          <div className="flex justify-between items-center w-full my-8">
            <div className="text-left">
              <p className="text-body1 text-gray-4">{ownerName}</p>
              <p className="text-h2 text-[#f5f5f5]">
                {stats.questionCount
                  ? Math.round((myCorrectCount / stats.questionCount) * 100)
                  : 0}
                <span className="text-st1"> 점</span>
              </p>
            </div>
            <div className="text-body1 w-25">
              <p className="flex justify-between items-center">
                <span>문제 수</span>
                <span className="text-primary-light">
                  {stats.questionCount}
                </span>
              </p>
              <p className="flex justify-between items-center">
                <span>맞힌 개수</span>
                <span className="text-primary-light">{myCorrectCount}</span>
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-6">
            {questions.map((q) => {
              const total =
                (q.counts ?? []).reduce((a, b) => a + (Number(b) || 0), 0) || 0;
              const myPick = myAnswers.get(q.questionId) ?? null; // 1~4 or null

              return (
                <div
                  key={q.questionId}
                  className="w-full p-5 border border-primary-light rounded-lg"
                >
                  <h4 className="font-bold text-h7 mb-4">{q.title}</h4>

                  <div className="space-y-0">
                    {q.options.map((opt, optIndex) => {
                      const c = Number(q.counts?.[optIndex] ?? 0);
                      const pct = total ? Math.round((c / total) * 100) : 0;
                      const optionNum = optIndex + 1;
                      const isCorrect = Number(q.answer ?? 0) === optionNum;
                      const isMine = myPick === optionNum;

                      // 툴팁용 이름 목록 (훅의 헬퍼 사용)
                      const takers =
                        typeof getOptionTakers === "function"
                          ? getOptionTakers(q.questionId, optionNum) // string[]
                          : [];

                      return (
                        <div
                          key={optIndex}
                          className={`relative flex justify-between items-center p-3 rounded-md ${
                            isCorrect ? "bg-green-500/10" : ""
                          }`}
                          // 행 전체에 hover 핸들러(툴팁 on/off)
                          onMouseEnter={() =>
                            setHover({
                              qid: q.questionId,
                              opt: optionNum,
                              show: true,
                            })
                          }
                          onMouseLeave={() =>
                            setHover({ qid: null, opt: null, show: false })
                          }
                          style={{ overflow: "visible" }} // 툴팁 잘리지 않게
                        >
                          {/* 퍼센트 바 (뒤 배경) */}
                          <div
                            className={`absolute left-0 top-0 h-full opacity-20 ${
                              isCorrect ? "bg-green-500" : "bg-[#888]"
                            } pointer-events-none`}
                            style={{ width: `${pct}%` }}
                          />

                          {/* 툴팁: 해당 선지에 마우스 올리면, 고른 사람 명단 */}
                          {hover.show &&
                            hover.qid === q.questionId &&
                            hover.opt === optionNum && (
                              <div className="absolute -top-2 left-0 z-20 bg-black text-white text-xs rounded px-2 py-1 whitespace-pre-wrap max-w-[520px]">
                                {takers.length
                                  ? `${takers.length}명: ${takers.join(", ")}`
                                  : "아직 이 보기를 고른 사람이 없습니다"}
                              </div>
                            )}

                          {/* 좌측: 체크박스 + 보기 텍스트 */}
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                              <CheckBoxIcon className="absolute w-4 h-4" />
                              {isMine && (
                                <CheckBoxCheckIcon className="absolute w-4 h-4" />
                              )}
                            </div>
                            <span className="text-body2">{opt}</span>
                          </div>

                          {/* 우측: 퍼센트/정답/오답 아이콘(내 선택 기준) */}
                          <div className="flex items-center gap-2 relative z-10">
                            <span className="text-caption text-[#f5f5f5]">
                              {pct}%
                            </span>
                            {isMine ? (
                              isCorrect ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              ) : (
                                <XCircleIcon className="w-5 h-5 text-red-500" />
                              )
                            ) : (
                              <div className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ============ 오른쪽 사이드바 ============ */}
        <aside className="w-[244px] mt-44 flex-shrink-0 flex flex-col gap-4">
          <div className="w-full p-4 flex flex-col items-center border border-primary-light rounded-lg">
            <p className="">개별 점수 보기</p>
            <div className="w-full mt-4 flex flex-col items-center max-h-[240px] overflow-y-scroll scrollbar-hide">
              {[...scores].reverse().map((p) => (
                <button
                  key={p.QP_id}
                  onClick={() => {
                    navigate(
                      `/play/quiz/result/${resultId}/${uuid}/${p.QP_id}`
                    );
                  }}
                  className="w-full px-4 py-2 flex justify-between cursor-pointer rounded-lg hover:bg-primary-light/50"
                >
                  <p>{p.name}</p>
                  <span>
                    {stats.questionCount
                      ? Math.round((p.score / stats.questionCount) * 100)
                      : 0}
                    점
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="w-full p-4">
            <div className="w-full flex justify-between items-center gap-3">
              <button
                onClick={openShareModal}
                className="flex-1 py-1.5 text-button border-1 border-secondary-light rounded-[4px] text-secondary-light hover:bg-secondary hover:text-primary-dark"
              >
                퀴즈 공유
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className={[
                  "flex-1 py-1.5 text-button border-1 rounded-[4px]",
                  deleting
                    ? "border-secondary-light text-secondary-light cursor-not-allowed"
                    : "border-secondary-light text-secondary-light hover:bg-secondary hover:text-primary-dark",
                ].join(" ")}
              >
                {deleting ? "삭제 중..." : "퀴즈 삭제"}
              </button>
            </div>
          </div>
          <div className="w-full p-4 border border-primary-light rounded-lg">
            <SmallServices />
          </div>
        </aside>
      </div>

      {/* 공유 모달 */}
      <ShareModal
        open={modalOpen}
        onClose={closeShareModal}
        url={shareUrl}
        loading={false}
        error={null}
      />
    </div>
  );
}
