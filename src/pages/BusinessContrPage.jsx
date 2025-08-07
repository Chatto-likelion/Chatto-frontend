import {
  Header,
  ChatList,
  FileUpload,
  BigServices,
  DetailForm,
  SmallServices,
} from "@/components";
import { postAnalyze_Bus, getAnalysisDetail_Bus } from "@/apis/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

export default function BusinessContrPage() {
  const { selectedChatId } = useChat();
  const navigate = useNavigate();

  const [peopleNum, setPeopleNum] = useState("23명");
  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const convertPeriodToDate = (label, type) => {
    const now = new Date();
    switch (label) {
      case "처음부터":
        return new Date(now.getFullYear() - 1, 0, 1).toISOString(); // 1년 전 기준
      default:
        return type === "end"
          ? now.toISOString()
          : new Date(now.getFullYear() - 1, 0, 1).toISOString();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedChatId) {
      alert("먼저 채팅을 선택하세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    const payload = {
      people_num: parseInt(peopleNum),
      rel: relation,
      situation,
      analysis_start: convertPeriodToDate(startPeriod, "start"),
      analysis_end: convertPeriodToDate(endPeriod, "end"),
    };

    try {
      const analyzeResponse = await postAnalyze_Bus(selectedChatId, payload);
      const resultId = analyzeResponse.result_id;

      const detailResponse = await getAnalysisDetail_Bus(resultId);
      setAnalysisResult(detailResponse);
    } catch (err) {
      console.error(err);
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 선택된 채팅이 바뀌면 결과 초기화
    setAnalysisResult(null);
    setError(null);
  }, [selectedChatId]);

  return (
    <div className="flex flex-col justify-start items-center h-screen bg-white text-primary-dark">
      <Header />
      <div className="relative flex-1 w-308.25 mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div
          className={`gap-5 pt-50 ${
            analysisResult ? "w-61.5 mr-34.5" : "w-53.5 mr-60.5"
          } flex flex-col items-center justify-center`}
        >
          <div className="absolute left-0 top-6 w-full flex justify-start items-end gap-2 text-primary-dark">
            <div
              className="text-h6 cursor-pointer flex justify-center items-center"
              onClick={() => {
                navigate("/business");
              }}
            >
              <p className="">
                Chatto <span className="bold">Business</span>
              </p>
            </div>
            <p className="text-body2">업무 기여도 분석</p>
          </div>
          <ChatList />
          <FileUpload />

          {analysisResult && (
            <div className="w-full flex justify-between items-center">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-16 h-8.5 hover:bg-primary hover:text-white cursor-pointer px-0.25 py-2 text-button text-primary border border-primary rounded-lg"
              >
                결과 공유
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-16 h-8.5 hover:bg-primary hover:text-white cursor-pointer px-0.25 py-2 text-button text-primary border border-primary rounded-lg"
              >
                결과 저장
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-16 h-8.5 hover:bg-primary hover:text-white cursor-pointer px-0.25 py-2 text-button text-primary border border-primary rounded-lg"
              >
                퀴즈 생성
              </button>
            </div>
          )}
        </div>

        {/* 가운데 */}
        <main
          className={`flex-1 overflow-y-auto max-h-240 scrollbar-hide pt-28 ${
            analysisResult ? "w-163.25 pr-18" : "w-100 pr-57"
          } flex flex-col justify-start items-center`}
        >
          {!loading && !analysisResult && (
            <>
              <Icons.ContrIconFull className="mb-5" />
              <div className="w-full flex flex-col items-center text-gray-8 text-body2 text-center mb-18">
                <p>팀원의 업무 기여도가 얼마나 높을까요?</p>
                <p>
                  주고받은 대화 데이터를 기반으로,
                  <br />각 참여자의 정보 공유, 업무 조율, 협력 기여도를
                  객관적으로 분석합니다.
                  <br />팀 내 소통 패턴과 역할 분담의 균형을 한눈에
                  확인해보세요.
                </p>
              </div>

              {/* 세부 정보 폼 */}
              <div className="w-96 py-6.5 pl-11 pr-10 flex flex-col items-center border-2 border-primary rounded-lg">
                <div className="mb-8 flex flex-col gap-1">
                  <div className="pl-1.5 gap-1 flex justify-center items-end">
                    <span className="bold text-h6 text-gray-7">세부 정보</span>
                    <span className="text-caption text-gray-5">(Optional)</span>
                  </div>
                  <p className="text-caption text-gray-7">
                    더 자세한 분석을 위해 추가 정보를 설정합니다.
                  </p>
                </div>
                <DetailForm
                  isAnalysis={false}
                  peopleNum={peopleNum}
                  setPeopleNum={setPeopleNum}
                  relation={relation}
                  setRelation={setRelation}
                  situation={situation}
                  setSituation={setSituation}
                  startPeriod={startPeriod}
                  setStartPeriod={setStartPeriod}
                  endPeriod={endPeriod}
                  setEndPeriod={setEndPeriod}
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-6 w-19.75 h-8.5 hover:bg-primary hover:text-white cursor-pointer px-3 py-2 text-button text-primary-dark border border-primary rounded-lg "
              >
                분석 시작
              </button>
            </>
          )}

          {/* 결과 출력 */}
          {loading && (
            <p className="mt-44 text-sm text-primary-dark">분석 중입니다...</p>
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          {analysisResult && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="w-full flex flex-col gap-4 p-6 text-left">
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-st1 text-primary-dark">
                      업무 기여도 평균
                    </span>
                    <span className="text-h2 text-primary-dark">82점</span>
                  </div>
                  <div className="flex flex-col text-st2 text-black gap-0.5 mt-1">
                    <p>분석된 메시지 수: 1,342개</p>
                    <p>참여자 수: 23명</p>
                    <p>분석 기간: 최근 6개월</p>
                  </div>
                </div>
                <div className="text-st2 text-primary-dark italic mt-2">
                  한 마디: “웃음과 공감이 폭발하는 안정적 팀워크!”
                </div>
              </div>

              <div className="w-full h-350 mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-primary rounded-lg text-body2 text-black whitespace-pre-line">
                {analysisResult.content}
                {/* 대화 톤 */}
                <div>
                  <p className="text-h6 font-bold mb-1">대화 톤</p>
                  <p>업무 중심적 표현 비중: 58%</p>
                  <p>격려 및 긍정 피드백 빈도: 24%</p>
                  <p>비판적 피드백: 12%</p>
                </div>

                {/* 예시 대화 */}
                <div>
                  <p className="text-h6 font-bold mb-1">예시 대화</p>
                  <p>A: 이번 보고서 일정 공유합니다. 확인 부탁드립니다.</p>
                  <p>B: 네, 일정 확인했고 제 파트 진행 중입니다.</p>
                  <p>C: 수정사항 있으면 말씀주세요. 바로 반영하겠습니다.</p>
                  <p className="mt-2">
                    분석: 명확한 업무 공유와 즉각적인 협조 의사가 나타납니다.
                  </p>
                </div>

                {/* 응답 패턴 */}
                <div>
                  <p className="text-h6 font-bold mb-1">응답 패턴</p>
                  <p>평균 응답 시간: 47분</p>
                  <p>즉각 응답 비율: 65%</p>
                  <p>응답 지연 발생률: 10%</p>
                  <p className="mt-2">
                    분석: 전반적으로 응답이 신속하며 협업 효율이 높습니다.
                  </p>
                </div>

                {/* 대화 주제 비율 */}
                <div>
                  <p className="text-h6 font-bold mb-1">대화 주제 비율</p>
                  <p>프로젝트 진행/조율: 54%</p>
                  <p>문제 해결 및 아이디어 공유: 28%</p>
                  <p>잡담/비업무: 12%</p>
                  <p>칭찬/격려: 6%</p>
                </div>

                {/* 기여도 요약 */}
                <div>
                  <p className="text-h6 font-bold mb-1">기여도 요약</p>
                  <p>평균 기여 수준: 높음</p>
                  <p>핵심 기여 언급: ‘공유’, ‘조율’, ‘제안’</p>
                  <p>보조 기여 언급: ‘확인’, ‘참조’</p>
                  <p className="mt-2">
                    분석: 참여자 대부분이 역할을 명확히 수행하며 주도적으로
                    협업에 기여합니다.
                  </p>
                </div>

                {/* 관계 및 네트워크 특성 */}
                <div>
                  <p className="text-h6 font-bold mb-1">
                    네트워크 및 협업 구조
                  </p>
                  <p className="font-semibold mt-2">협업 밀도: 81%</p>
                  <p className="text-body2 mb-2">
                    다수의 구성원이 서로 긴밀히 연결되어 실시간으로 피드백을
                    주고받는 구조입니다.
                  </p>

                  <p className="font-semibold mt-2">주요 역할 유형</p>
                  <p className="text-body2">
                    리더/조율자: 2명
                    <br />
                    핵심 기여자: 4명
                    <br />
                    서포터: 5명
                    <br />
                    관망자: 6명
                  </p>
                </div>

                {/* AI 종합 평가 */}
                <div>
                  <p className="text-h6 font-bold mb-1 mt-4 border-t border-primary-light pt-2">
                    AI 종합 평가
                  </p>
                  <p className="text-body2">
                    이 그룹은 신속한 정보 공유와 명확한 업무 분담이 강점입니다.
                    다만 일부 관망자들의 참여 빈도를 높이고, 비판적 피드백의
                    건설적 활용을 강화하면 협업의 시너지가 더욱 향상될 수
                    있습니다.
                  </p>
                </div>

                {/* Tip */}
                <div>
                  <p className="text-h6 font-bold text-yellow-400 mt-4">Tip</p>
                  <p className="text-yellow-400">
                    정기적인 진행 상황 공유 세션과 작은 성과 공유를
                    시도해보세요.
                    <br />
                    참여율이 낮은 멤버에게 역할과 기여 기대치를 명확히 안내하는
                    것도 유익합니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 오른쪽 */}
        <div
          className={`${
            analysisResult ? "w-46.75" : "w-37.25"
          } mt-50 flex flex-col items-center justify-start gap-4`}
        >
          {analysisResult && (
            <div className="w-full py-4 px-1 flex flex-col justify-center items-center border-2 border-primary rounded-lg  bg-white">
              <DetailForm
                isAnalysis={true}
                peopleNum={peopleNum}
                setPeopleNum={setPeopleNum}
                relation={relation}
                setRelation={setRelation}
                situation={situation}
                setSituation={setSituation}
                startPeriod={startPeriod}
                setStartPeriod={setStartPeriod}
                endPeriod={endPeriod}
                setEndPeriod={setEndPeriod}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-6 w-19.75 h-8.5 hover:bg-primary hover:text-white px-3 py-2 text-button text-primary border border-primary rounded-lg"
              >
                다시 분석
              </button>
            </div>
          )}

          <div
            className={`w-full  ${
              analysisResult ? "h-30" : " h-full"
            } border-2 border-primary rounded-lg p-3 pb-5 bg-white`}
          >
            {analysisResult ? <SmallServices /> : <BigServices />}
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-dark fixed bottom-5 right-12" />
    </div>
  );
}
