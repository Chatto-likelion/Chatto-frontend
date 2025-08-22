// src/hooks/useQuizPersonalAnswer.js
import { useState, useEffect } from "react";
// import { getQuizPersonalAnswer } from "@/apis/api"; // 실제 API 함수

// --- 더미 데이터 ---
const dummyDetails = {
  relationship: "동아리 부원",
  situation: "일상대화",
  period: "처음부터",
};
const dummyQuizSections = [
  {
    sectionTitle: "대화 특징",
    questions: [
      {
        id: 1,
        title: "Q1 어쩌고 저쩌고",
        options: [
          "가나다라",
          "가나다라마바사아자차카타파하가나다라",
          "가나다라",
          "가나다라다다",
        ],
        correctOptionIndex: 1,
        userSelectedOptionIndex: 1,
      },
    ],
  },
  {
    sectionTitle: "가장 많이 틀린 문제",
    questions: [
      {
        id: 2,
        title: "Q2 어쩌고 저쩌고",
        options: ["가나다라", "가나다라", "가나다라", "가나다라"],
        correctOptionIndex: 0,
        userSelectedOptionIndex: 2,
      },
    ],
  },
];
const dummyResultOwner = { name: "모모", score: 85 };
// -----------------

/*
// ▼▼▼ 백엔드 연동 시 사용할 실제 훅 ▼▼▼
export function useQuizPersonalAnswer(resultId) {
  const [details, setDetails] = useState({});
  const [sections, setSections] = useState([]);
  const [owner, setOwner] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // 실제 API 호출 (URL 파라미터는 resultId를 사용한다고 가정)
        const result = await getQuizPersonalAnswer(resultId);
        setDetails(result.details);
        setSections(result.sections);
        setOwner(result.owner);
      } catch (err) {
        setError("개인 퀴즈 결과를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resultId]);

  return { details, sections, owner, loading, error };
}
*/

// ▼▼▼ 현재 사용할 더미 데이터용 훅 ▼▼▼
export function useQuizPersonalAnswer(resultId) {
  const [details, setDetails] = useState({});
  const [sections, setSections] = useState([]);
  const [owner, setOwner] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDetails(dummyDetails);
      setSections(dummyQuizSections);
      setOwner(dummyResultOwner);
      setLoading(false);
    }, 500);
  }, [resultId]);

  return { details, sections, owner, loading, error };
}
