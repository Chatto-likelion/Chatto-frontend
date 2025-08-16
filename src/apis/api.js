import { instance, instanceWithToken } from "./axios";

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
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("입력값이 올바르지 않습니다.");
      }
    }
    console.error("회원가입 에러:", error);
    throw error;
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
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
      if (error.response.status === 404) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }
    }
    console.error("로그인 에러: ", error);
    throw error;
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
    console.log("사용자 정보 조회 에러:", response);
  }
};

/**
 * ✅ 파일 업로드 및 관리
 */

export const postChat = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await instanceWithToken.post("/play/chat/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 201) {
      console.log("파일 업로드 성공:", response.data);
      return response.data; // { chat_id_play_chem: integer }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        throw new Error("파일 또는 입력값이 잘못되었습니다. (400)");
      }
      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
    }
    console.error("파일 업로드 에러:", error);
    throw new Error("파일 업로드 중 오류가 발생했습니다.");
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
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("해당 채팅을 삭제할 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("채팅 파일을 찾을 수 없습니다. (404)");
      }
    }

    console.error("채팅 삭제 에러:", error);
    throw new Error("채팅 삭제 중 문제가 발생했습니다.");
  }
};

export const putChat = async (chatId, title) => {
  try {
    const res = await instanceWithToken.put(`/play/chat/${chatId}/`, { title });

    if (res.status === 200) return;
    throw new Error(`예상치 못한 응답 상태: ${res.status}`);
  } catch (error) {
    if (error.response) {
      const { status } = error.response;
      if (status === 400) throw new Error("입력값이 잘못되었습니다. (400)");
      if (status === 401) throw new Error("로그인이 필요합니다. (401)");
      if (status === 403)
        throw new Error("해당 채팅을 수정할 권한이 없습니다. (403)");
      if (status === 404) throw new Error("채팅을 찾을 수 없습니다. (404)");
      if (status === 415)
        throw new Error("지원하지 않는 Content-Type 입니다. (415)");
    }
    console.error("채팅 이름 수정 에러:", error);
    throw new Error("채팅 이름 수정 중 오류가 발생했습니다.");
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
    if (error.response?.status === 401) {
      throw new Error("로그인이 필요합니다. (401)");
    }

    console.error("채팅 목록 조회 에러:", error);
    throw new Error("채팅 목록을 불러오는 데 실패했습니다.");
  }
};

export const postChemiAnalyze = async (chatId, payload) => {
  try {
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
    if (error.response) {
      const status = error.response.status;

      if (status === 400) {
        throw new Error("입력값이 잘못되었습니다. (400)");
      }
      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("분석 요청 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("해당 채팅을 찾을 수 없습니다. (404)");
      }
    }

    console.error("분석 요청 에러:", error);
    throw new Error("채팅 분석 요청 중 문제가 발생했습니다.");
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
    if (error.response) {
      const status = error.response.status;

      if (status === 400) {
        throw new Error("입력값이 잘못되었습니다. (400)");
      }
      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("분석 요청 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("해당 채팅을 찾을 수 없습니다. (404)");
      }
    }

    console.error("분석 요청 에러:", error);
    throw new Error("채팅 분석 요청 중 문제가 발생했습니다.");
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
    if (error.response) {
      const status = error.response.status;

      if (status === 400) {
        throw new Error("입력값이 잘못되었습니다. (400)");
      }
      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("분석 요청 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("해당 채팅을 찾을 수 없습니다. (404)");
      }
    }

    console.error("분석 요청 에러:", error);
    throw new Error("채팅 분석 요청 중 문제가 발생했습니다.");
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
    if (error.response?.status === 401) {
      throw new Error("로그인이 필요합니다. (401)");
    }
    console.error("분석 목록 조회 에러:", error);
    throw new Error("분석 목록을 불러오는 데 실패했습니다.");
  }
};

export const getChemiAnalysisDetail = async (resultId) => {
  try {
    const response = await instanceWithToken.get(
      `/play/analysis/chem/${resultId}/detail/`
    );
    return response.data; // { content }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("접근 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }
    console.error("상세 결과 조회 에러:", error);
    throw new Error("분석 결과를 불러오는 데 실패했습니다.");
  }
};

export const getSomeAnalysisDetail = async (resultId) => {
  try {
    const response = await instanceWithToken.get(
      `/play/analysis/some/${resultId}/detail/`
    );
    return response.data; // { content }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("접근 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }
    console.error("상세 결과 조회 에러:", error);
    throw new Error("분석 결과를 불러오는 데 실패했습니다.");
  }
};

export const getMbtiAnalysisDetail = async (resultId) => {
  try {
    const response = await instanceWithToken.get(
      `/play/analysis/mbti/${resultId}/detail/`
    );
    return response.data; // { content }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("접근 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }
    console.error("상세 결과 조회 에러:", error);
    throw new Error("분석 결과를 불러오는 데 실패했습니다.");
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
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("해당 결과를 삭제할 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }

    console.error("분석 결과 삭제 에러:", error);
    throw new Error("분석 결과 삭제 중 오류가 발생했습니다.");
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
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("해당 결과를 삭제할 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }

    console.error("분석 결과 삭제 에러:", error);
    throw new Error("분석 결과 삭제 중 오류가 발생했습니다.");
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
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("해당 결과를 삭제할 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }

    console.error("분석 결과 삭제 에러:", error);
    throw new Error("분석 결과 삭제 중 오류가 발생했습니다.");
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
    const response = await instanceWithToken.post("/business/chat/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 201) {
      console.log("파일 업로드 성공:", response.data);
      return response.data; // { chat_id_play_chem: integer }
    } else {
      throw new Error("알 수 없는 응답 상태입니다.");
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        throw new Error("파일 또는 입력값이 잘못되었습니다. (400)");
      }
      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
    }
    console.error("파일 업로드 에러:", error);
    throw new Error("파일 업로드 중 오류가 발생했습니다.");
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
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error("로그인이 필요합니다. (401)");
      }
      if (status === 403) {
        throw new Error("해당 채팅을 삭제할 권한이 없습니다. (403)");
      }
      if (status === 404) {
        throw new Error("채팅 파일을 찾을 수 없습니다. (404)");
      }
    }

    console.error("채팅 삭제 에러:", error);
    throw new Error("채팅 삭제 중 문제가 발생했습니다.");
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
    if (error.response) {
      const { status } = error.response;
      if (status === 400) throw new Error("입력값이 잘못되었습니다. (400)");
      if (status === 401) throw new Error("로그인이 필요합니다. (401)");
      if (status === 403)
        throw new Error("해당 채팅을 수정할 권한이 없습니다. (403)");
      if (status === 404) throw new Error("채팅을 찾을 수 없습니다. (404)");
      if (status === 415)
        throw new Error("지원하지 않는 Content-Type 입니다. (415)");
    }
    console.error("채팅 이름 수정 에러:", error);
    throw new Error("채팅 이름 수정 중 오류가 발생했습니다.");
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
    if (error.response?.status === 401) {
      throw new Error("로그인이 필요합니다. (401)");
    }

    console.error("채팅 목록 조회 에러:", error);
    throw new Error("채팅 목록을 불러오는 데 실패했습니다.");
  }
};

// 분석 요청
export const postContrAnalyze = async (chatId, payload) => {
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
};

// 분석 결과 저장
export const saveAnalysis_Bus = async (resultId) => {
  const response = await instanceWithToken.post(
    `/business/analysis/${resultId}/save/`
  );

  if (response.status === 204) {
    console.log("결과 저장 성공");
  } else {
    throw new Error("저장 실패");
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
    if (error.response?.status === 401) {
      throw new Error("로그인이 필요합니다. (401)");
    }
    console.error("분석 목록 조회 에러:", error);
    throw new Error("분석 목록을 불러오는 데 실패했습니다.");
  }
};

// 분석 상세 조회
export const getContrAnalysisDetail = async (resultId) => {
  const response = await instanceWithToken.get(
    `/business/analysis/${resultId}/detail/`
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("상세 조회 실패");
  }
};

// 분석 결과 삭제
export const deleteContrAnalysis = async (resultId) => {
  const response = await instanceWithToken.delete(
    `/business/analysis/${resultId}/detail/`
  );

  if (response.status === 204) {
    console.log("분석 결과 삭제 성공");
  } else {
    throw new Error("삭제 실패");
  }
};

/**
 * ✅ 사용자 정보 관리
 */
export const updateMe = async (data) => {
  const response = await instanceWithToken.put("/me", data);
  if (response.status === 200) {
    console.log("사용자 정보 수정 성공");
    return response.data;
  } else {
    console.log("사용자 정보 수정 에러:", response);
  }
};
