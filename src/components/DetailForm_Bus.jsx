export default function DetailForm_Bus({
  isAnalysis,
  peopleNum,
  setPeopleNum,
  relation,
  setRelation,
  situation,
  setSituation,
  startPeriod,
  setStartPeriod,
  endPeriod,
  setEndPeriod,
}) {
  const ww = isAnalysis ? "" : "w-76"; // 기본 너비
  const w = isAnalysis ? "w-20" : "w-30.75";
  const gap = isAnalysis ? "gap-5" : "gap-26";
  const text = isAnalysis ? "text-body2" : "text-st1";

  return (
    <div className={`${ww} ${text} flex flex-col gap-3`}>
      <div className={`w-full ${gap} flex justify-end items-center`}>
        <p className="">분석대상 ⓘ</p>
        <div className={`${w} pr-3.25 flex justify-end items-center`}>
          <select
            className={`${text} text-end`}
            value={peopleNum}
            onChange={(e) => setPeopleNum(e.target.value)}
          >
            <option>23명</option>
            <option>10명</option>
          </select>
        </div>
      </div>
      <div className={`w-full ${gap} flex justify-end items-center`}>
        <p className="">참여자 관계</p>
        <div className={`${w} pr-3.25 flex justify-end items-center`}>
          <select
            className={`${text} text-end`}
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
          >
            <option>동아리 부원</option>
            <option>회사 동료</option>
          </select>
        </div>
      </div>
      <div className={`w-full ${gap} flex justify-end items-center`}>
        <p className="">대화 상황</p>
        <div className={`${w} pr-3.25 flex justify-end items-center`}>
          <select
            className={`${text} text-end`}
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          >
            <option>일상대화</option>
            <option>업무대화</option>
          </select>
        </div>
      </div>
      <div className={`w-full ${gap} flex justify-end items-center`}>
        <p className="">분석 기간</p>
        <div className={`${w} flex justify-end items-center`}>
          <select
            className={`${text} text-end`}
            value={startPeriod}
            onChange={(e) => setStartPeriod(e.target.value)}
          >
            <option>처음부터</option>
            <option>최근 1개월</option>
          </select>
          <p className="w-3.25 text-st2 text-primary-light">~</p>
        </div>
      </div>
      <div className={`w-full ${gap} flex justify-end items-center`}>
        <div className={`${w} pr-3.25 flex justify-end items-center`}>
          <select
            className={`${text} text-end`}
            value={endPeriod}
            onChange={(e) => setEndPeriod(e.target.value)}
          >
            <option>끝까지</option>
            <option>최근 1개월</option>
          </select>
        </div>
      </div>
    </div>
  );
}
