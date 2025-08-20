import { instance, instanceWithToken } from "./axios";

/** 인터셉터가 refresh 재시도까지 했는데도 401인 "최종 401"인지 판별 */
const isFinal401 = (error) =>
  error?.response?.status === 401 && error?.config?._retry === true;

/** 상태코드 → 메시지 매핑 후 던지기 (401은 최종일 때만) */
function throwMapped(error, map = {}) {
  const status = error?.response?.status;

  if (status === 401) {
    if (isFinal401(error)) {
      throw new Error(map[401] ?? "로그인이 필요합니다. (401)");
    }
    // 최종 401이 아니면 인터셉터가 처리/재시도 중이었거나 이미 처리됨
    // 여기선 굳이 메시지/로그를 남기지 않고 원본 에러를 그대로 전달
    throw error;
  }

  if (status && map[status]) throw new Error(map[status]);
  throw error;
}

export const signup = async (data) => {
  try {
    const response = await instance.post("/account/signup/", {
      username: data.username,
      phone: data.phone,
      email: data.email,
      verf_num: data.verf_num,
      password: data.password,
      password_confirm: data.password_confirm,
    });

    if (response.status === 201) {
      return response.data;
    }
  } catch (error) {
    throwMapped(error, { 400: "입력값이 올바르지 않습니다. (400)" });
  }
};

// 로그인
export const login = async (data) => {
  try {
    const response = await instance.post("/account/login/", {
      username: data.username,
      password: data.password,
    });

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    throwMapped(error, {
      400: "아이디 또는 비밀번호가 올바르지 않습니다. (400)",
      404: "사용자를 찾을 수 없습니다. (404)",
    });
  }
};

// 로그아웃
export const logout = async () => {
  const response = await instance.post("/account/logout/");
  if (response.status === 200) {
    window.location.href = "/";
  } else {
    console.log("로그아웃 에러:", response);
  }
};

// 현재 로그인 사용자 정보 조회
export const getMe = async () => {
  const response = await instanceWithToken.get("/account/profile/");
  if (response.status === 200) {
    return response.data;
  } else {
    throwMapped(error, { 401: "로그인이 필요합니다. (401)" });
  }
};

export const putProfile = async (data) => {
  try {
    const res = await instanceWithToken.put(`/account/profile/`, data);

    if (res.status === 200) return res.data;
    throw new Error(`예상치 못한 응답 상태: ${res.status}`);
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)", // ← 최종 401일 때만 발동
      404: "유저 정보를 찾을 수 없습니다. (404)",
    });
  }
};

/**
 * ✅ 파일 업로드 및 관리
 */

export const postChat = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await instanceWithToken.post("/play/chat/", formData);

    if (response.status === 201) {
      console.log("파일 업로드 성공:", response.data);
      return response.data; // { chat_id_play_chem: integer }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "파일 또는 입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)", // 최종 401만
    });
  }
};

export const deleteChat = async (chatId) => {
  try {
    const response = await instanceWithToken.delete(`/play/chat/${chatId}/`);

    if (response.status === 204) {
      console.log("채팅 삭제 성공");
      return;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 삭제할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

export const putChat = async (chatId, title) => {
  try {
    const res = await instanceWithToken.put(`/play/chat/${chatId}/`, { title });

    if (res.status === 200) return;
    throw new Error(`예상치 못한 응답 상태: ${res.status}`);
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 업로드할 권한이 없습니다. (403)",
      404: "파일을 찾을 수 없습니다. (404)",
      415: "지원하지 않는 Content-Type 입니다. (415)",
    });
  }
};

export const getChatList = async () => {
  try {
    const response = await instanceWithToken.get(`/play/chat/`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, { 401: "로그인이 필요합니다. (401)" });
  }
};

export const postChemiAnalyze = async (chatId, payload) => {
  try {
    console.log(payload);
    const response = await instanceWithToken.post(
      `/play/chat/${chatId}/analyze/chem/`,
      payload
    );

    if (response.status === 201) {
      console.log("분석 성공:", response.data);
      return response.data; // { result_id: number }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 분석할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

export const postSomeAnalyze = async (chatId, payload) => {
  try {
    const response = await instanceWithToken.post(
      `/play/chat/${chatId}/analyze/some/`,
      payload
    );

    if (response.status === 201) {
      console.log("분석 성공:", response.data);
      return response.data; // { result_id: number }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 분석할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

export const postMbtiAnalyze = async (chatId, payload) => {
  try {
    const response = await instanceWithToken.post(
      `/play/chat/${chatId}/analyze/mbti/`,
      payload
    );

    if (response.status === 201) {
      console.log("분석 성공:", response.data);
      return response.data; // { result_id: number }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 분석할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

/**
 * ✅ 분석 결과
 */

export const getAnalysisList = async () => {
  try {
    const response = await instanceWithToken.get(`/play/analysis/all/`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
    });
  }
};

export const getChemiAnalysisDetail = async (resultId) => {
  try {
    const response = await instanceWithToken.get(
      `/play/analysis/chem/${resultId}/detail/`
    );
    return response.data; // { content }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 분석 결과에 권한이 없습니다. (403)",
      404: "분석 결과를 찾을 수 없습니다. (404)",
    });
  }
};

export const getSomeAnalysisDetail = async (resultId) => {
  try {
    const response = await instanceWithToken.get(
      `/play/analysis/some/${resultId}/detail/`
    );
    return response.data; // { content }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 분석 결과에 권한이 없습니다. (403)",
      404: "분석 결과를 찾을 수 없습니다. (404)",
    });
  }
};

export const getMbtiAnalysisDetail = async (resultId) => {
  try {
    const response = await instanceWithToken.get(
      `/play/analysis/mbti/${resultId}/detail/`
    );
    return response.data; // { content }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 분석 결과에 권한이 없습니다. (403)",
      404: "분석 결과를 찾을 수 없습니다. (404)",
    });
  }
};

export const deleteChemiAnalysis = async (resultId) => {
  try {
    const response = await instanceWithToken.delete(
      `/play/analysis/chem/${resultId}/detail/`
    );

    if (response.status === 204) {
      console.log("분석 결과 삭제 성공");
      return;
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 분석을 삭제할 권한이 없습니다. (403)",
      404: "분석 결과을 찾을 수 없습니다. (404)",
    });
  }
};

export const deleteSomeAnalysis = async (resultId) => {
  try {
    const response = await instanceWithToken.delete(
      `/play/analysis/some/${resultId}/detail/`
    );

    if (response.status === 204) {
      console.log("분석 결과 삭제 성공");
      return;
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 분석을 삭제할 권한이 없습니다. (403)",
      404: "분석 결과을 찾을 수 없습니다. (404)",
    });
  }
};

export const deleteMbtiAnalysis = async (resultId) => {
  try {
    const response = await instanceWithToken.delete(
      `/play/analysis/mbti/${resultId}/detail/`
    );

    if (response.status === 204) {
      console.log("분석 결과 삭제 성공");
      return;
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 분석을 삭제할 권한이 없습니다. (403)",
      404: "분석 결과을 찾을 수 없습니다. (404)",
    });
  }
};

/**
 * ✅ 퀴즈
 */
//퀴즈 정보 겟
export const getChemiQuiz = async (result_id) => {
  try {
    const response = await instanceWithToken.get(
      `/play/quiz/chem/${result_id}/`
    );

    if (response.status === 200) {
      console.log("분석 성공:", response.data);
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

/**
 * ✅ 분석 결과 공유
 */
//uuid 생성
export const postUUID = async (type, result_id) => {
  try {
    const formData = new FormData();
    formData.append("type", type);

    const response = await instanceWithToken.post(
      `/play/chat/uuid/${result_id}/`,
      formData
    );

    if (response.status === 201) {
      console.log("분석 성공:", response.data);
      return response.data.uuid; // { uuid: string }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
      403: "분석 결과를 공유할 권한이 없습니다. (403)",
      404: "분석 결과를 찾을 수 없습니다. (404)",
    });
  }
};

export const postUUID_Bus = async (type, result_id) => {
  try {
    const formData = new FormData();
    formData.append("type", type);

    const response = await instanceWithToken.post(
      `/business/chat/uuid/${result_id}/`,
      formData
    );

    if (response.status === 201) {
      console.log("분석 성공:", response.data);
      return response.data.uuid; // { uuid: string }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
      403: "분석 결과를 공유할 권한이 없습니다. (403)",
      404: "분석 결과를 찾을 수 없습니다. (404)",
    });
  }
};

//guest 결과 보기
export const getChemiGuestDetail = async (uuid) => {
  try {
    const response = await instance.get(
      `/play/analysis/chem/guest/${uuid}/detail/`
    );

    if (response.status === 200) {
      console.log("분석 성공:", response.data);
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 분석할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

export const getSomeGuestDetail = async (uuid) => {
  try {
    const response = await instance.get(
      `/play/analysis/some/guest/${uuid}/detail/`
    );

    if (response.status === 200) {
      console.log("분석 성공:", response.data);
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 분석할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

export const getMbtiGuestDetail = async (uuid) => {
  try {
    const response = await instance.get(
      `/play/analysis/mbti/guest/${uuid}/detail/`
    );

    if (response.status === 200) {
      console.log("분석 성공:", response.data);
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 분석할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

export const getContrGuestDetail = async (uuid) => {
  try {
    const response = await instance.get(`/business/analysis/${uuid}/detail/`);

    if (response.status === 200) {
      console.log("분석 성공:", response.data);
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 분석할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

/**
 * ✅ 파일 업로드 및 관리
 */
// 파일 업로드
export const postChat_Bus = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await instanceWithToken.post("/business/chat/", formData);

    if (response.status === 201) {
      console.log("파일 업로드 성공:", response.data);
      return response.data; // { chat_id_play_chem: integer }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
    });
  }
};

// 채팅 삭제
export const deleteChat_Bus = async (chatId) => {
  try {
    const response = await instanceWithToken.delete(
      `/business/chat/${chatId}/delete/`
    );

    if (response.status === 204) {
      console.log("채팅 삭제 성공");
      return;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 삭제할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

export const putChat_Bus = async (chatId, title) => {
  try {
    const res = await instanceWithToken.put(`/business/chat/${chatId}/`, {
      title,
    });

    if (res.status === 200) return;
    throw new Error(`예상치 못한 응답 상태: ${res.status}`);
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 업로드할 권한이 없습니다. (403)",
      404: "파일을 찾을 수 없습니다. (404)",
      415: "지원하지 않는 Content-Type 입니다. (415)",
    });
  }
};

// 채팅 목록 조회
export const getChatList_Bus = async () => {
  try {
    const response = await instanceWithToken.get(`/business/chat/`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
    });
  }
};

// 분석 요청
export const postContrAnalyze = async (chatId, payload) => {
  try {
    const response = await instanceWithToken.post(
      `/business/chat/${chatId}/analyze/contrib/`,
      payload
    );

    if (response.status === 201) {
      console.log("분석 성공:", response.data);
      return response.data;
    } else {
      throw new Error("분석 실패");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 채팅을 분석할 권한이 없습니다. (403)",
      404: "채팅 파일을 찾을 수 없습니다. (404)",
    });
  }
};

// 분석 목록 조회
export const getAnalysisList_Bus = async () => {
  try {
    const response = await instanceWithToken.get(`/business/analysis/all/`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
    });
  }
};

// 분석 상세 조회
export const getContrAnalysisDetail = async (resultId) => {
  try {
    const response = await instanceWithToken.get(
      `/business/analysis/${resultId}/detail/`
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("상세 조회 실패");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "분석 결과에 권한이 없습니다. (403)",
      404: "분석 파일을 찾을 수 없습니다. (404)",
    });
  }
};

// 분석 결과 삭제
export const deleteContrAnalysis = async (resultId) => {
  try {
    const response = await instanceWithToken.delete(
      `/business/analysis/${resultId}/detail/`
    );

    if (response.status === 204) {
      console.log("분석 결과 삭제 성공");
      return;
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "해당 분석을 삭제할 권한이 없습니다. (403)",
      404: "분석 파일을 찾을 수 없습니다. (404)",
    });
  }
};

/**
 * 퀴즈 메인 페이지
 */
export const getQuizData = async (analysisId) => {
  try {
    const response = await instanceWithToken.get(
      `/play/analysis/${analysisId}/quiz/`
    );
    return response.data;
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
      403: "이 퀴즈에 접근할 권한이 없습니다. (403)",
      404: "해당 분석 결과를 찾을 수 없어 퀴즈를 생성할 수 없습니다. (404)",
    });
  }
};

/**
 * 크레딧
 */
//크레딧 충전
export const postCreditPurchase = async (data) => {
  try {
    const response = await instanceWithToken.post("/account/credit/purchase/", {
      amount: data.amount,
      payment: data.amount,
    });

    if (response.status === 201) {
      console.log("크레딧 충전 성공:", response.data);
      return response.data; // { chat_id_play_chem: integer }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
    });
  }
};

//크레딧 충전내역 조회
export const getCreditPurchaseList = async () => {
  try {
    const response = await instanceWithToken.get("/account/credit/purchase/");

    if (response.status === 200) {
      console.log("크레딧 충전 내역:", response.data);
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
    });
  }
};

//크레딧 사용
export const postCreditUsage = async (data) => {
  try {
    const response = await instanceWithToken.post("/account/credit/purchase/", {
      amount: data.amount,
      usage: data.usage,
      purpose: data.purpose,
    });

    if (response.status === 201) {
      console.log("크레딧 사용 성공:", response.data);
      return response.data; // { chat_id_play_chem: integer }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      400: "입력값이 잘못되었습니다. (400)",
      401: "로그인이 필요합니다. (401)",
    });
  }
};

//크레딧 사용내역 조회
export const getCreditUsageList = async () => {
  try {
    const response = await instanceWithToken.get("/account/credit/usage/");

    if (response.status === 200) {
      console.log("크레딧 사용 내역:", response.data);
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    throwMapped(error, {
      401: "로그인이 필요합니다. (401)",
    });
  }
};
