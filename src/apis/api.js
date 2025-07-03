import { instance, instanceWithToken } from "./axios";

const USE_MOCK = false; // 🚀 서버 붙이면 false로 바꾸기
/**
 * ✅ 인증 관련
 */

// 회원가입
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
      console.log("로그인 성공", response.data);
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
  const response = await instance.post("/logout");
  if (response.status === 200) {
    console.log("로그아웃 성공");
    window.location.href = "/";
  } else {
    console.log("로그아웃 에러:", response);
  }
};

// 현재 로그인 사용자 정보 조회
export const getMe = async () => {
  const response = await instance.get("/me");
  if (response.status === 200) {
    return response.data;
  } else {
    console.log("사용자 정보 조회 에러:", response);
  }
};

/**
 * ✅ 파일 업로드 및 관리
 */

export const postChat = async (userId, file) => {
  if (USE_MOCK) {
    console.log("📦 목업 파일 업로드 중...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 업로드 완료");
        resolve({
          chat_id_play_chem: 125, // 예시 ID
        });
      }, 800); // 0.8초 지연
    });
  }

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  const response = await instance.post("/play/chats/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (response.status === 201) {
    console.log("파일 업로드 성공:", response.data);
    return response.data; // { chat_id_play_chem: integer }
  } else {
    console.log("파일 업로드 에러:", response);
    throw new Error("파일 업로드 실패");
  }
};

export const deleteChat = async (chatId) => {
  if (USE_MOCK) {
    console.log("📦 목업 채팅 삭제 요청...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 삭제 완료");
        resolve();
      }, 500);
    });
  }

  try {
    const response = await instance.delete(`/play/chats/${chatId}/delete/`);

    if (response.status === 204) {
      console.log("채팅 삭제 성공");
      return;
    } else {
      console.error("알 수 없는 응답:", response);
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("잘못된 요청입니다. (400)");
      }
      if (error.response.status === 404) {
        throw new Error("파일을 찾을 수 없습니다. (404)");
      }
    }
    console.error("삭제 에러:", error);
    throw error;
  }
};

export const getChatList = async (userId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            chat_id_play_chem: 123,
            title: "멋사 잡담방",
            people_num: 23,
            uploaded_at: "2025-07-01T12:34:56",
          },
          {
            chat_id_play_chem: 125,
            title: "준영이",
            people_num: 2,
            uploaded_at: "2025-07-03T15:45:12",
          },
        ]);
      }, 500);
    });
  }

  try {
    const response = await instance.get(`/play/chats/${userId}/`);

    if (response.status === 200) {
      return response.data; // 배열
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("잘못된 요청입니다. (400)");
      }
      if (error.response.status === 404) {
        throw new Error("파일을 찾을 수 없습니다. (404)");
      }
    }
    console.error("목록 조회 에러:", error);
    throw error;
  }
};

export const postAnalyze = async (chatId, payload) => {
  if (USE_MOCK) {
    console.log("📦 [MOCK] 분석 요청:", { chatId, payload });
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ [MOCK] 분석 완료");
        resolve({
          result_id_play_chem: 999, // 예시 ID
        });
      }, 1000);
    });
  }

  try {
    const response = await instance.post(
      `/play/chats/${chatId}/analyze/`,
      payload
    );

    if (response.status === 201) {
      console.log("분석 성공:", response.data);
      return response.data; // { result_id_play_chem }
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("잘못된 요청입니다. (400)");
      }
      if (error.response.status === 404) {
        throw new Error("채팅을 찾을 수 없습니다. (404)");
      }
    }
    console.error("분석 요청 에러:", error);
    throw error;
  }
};

export const saveAnalysis = async (resultId) => {
  if (USE_MOCK) {
    console.log("📦 목업 결과 저장 요청...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 결과 저장 완료");
        resolve();
      }, 500);
    });
  }

  try {
    const response = await instance.post(`/play/analysis/${resultId}/save/`);

    if (response.status === 204) {
      console.log("결과 저장 성공");
      return;
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("잘못된 요청입니다. (400)");
      }
      if (error.response.status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }
    console.error("결과 저장 에러:", error);
    throw error;
  }
};

/**
 * ✅ 분석 결과
 */

export const getAnalysisList = async (userId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            analysis_date: "2024-07-01T12:00:00",
            title: "멋사 잡담방 케미 분석",
            analysis_type: "케미측정",
            analysis_result: "케미지수 78점",
          },
          {
            analysis_date: "2024-07-02T15:30:00",
            title: "양재동 패거리 케미 분석",
            analysis_type: "케미측정",
            analysis_result: "케미지수 82점",
          },
        ]);
      }, 500);
    });
  }

  try {
    const response = await instance.get(`/play/analysis/${userId}`, {
      // params: { user_id: userId },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("잘못된 요청입니다. (400)");
      }
      if (error.response.status === 404) {
        throw new Error("결과를 찾을 수 없습니다. (404)");
      }
    }
    console.error("분석 목록 조회 에러:", error);
    throw error;
  }
};

export const getAnalysisDetail = async (resultId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          content: "이것은 예시 분석 결과 내용입니다. 화이팅!",
        });
      }, 1000);
    });
  }

  try {
    const response = await instance.get(`/play/analysis/${resultId}/detail/`);

    if (response.status === 200) {
      return response.data; // { content }
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("잘못된 요청입니다. (400)");
      }
      if (error.response.status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }
    console.error("상세 결과 조회 에러:", error);
    throw error;
  }
};

export const deleteAnalysis = async (resultId) => {
  if (USE_MOCK) {
    console.log("📦 목업 분석 결과 삭제 요청...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 분석 결과 삭제 완료");
        resolve();
      }, 500);
    });
  }

  try {
    const response = await instance.delete(`/play/analysis/${resultId}/detail`);

    if (response.status === 204) {
      console.log("분석 결과 삭제 성공");
      return;
    } else {
      throw new Error("알 수 없는 응답 상태");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("잘못된 요청입니다. (400)");
      }
      if (error.response.status === 404) {
        throw new Error("분석 결과를 찾을 수 없습니다. (404)");
      }
    }
    console.error("분석 결과 삭제 에러:", error);
    throw error;
  }
};

/**
 * ✅ 파일 업로드 및 관리
 */
// 파일 업로드
export const postChat_Bus = async (userId, file) => {
  if (USE_MOCK) {
    console.log("📦 목업 파일 업로드 중...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 업로드 완료");
        resolve({
          chat_id_play_chem: 123,
        });
      }, 800);
    });
  }

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  const response = await instance.post("/business/chat/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (response.status === 201) {
    console.log("파일 업로드 성공:", response.data);
    return response.data;
  } else {
    throw new Error("파일 업로드 실패");
  }
};

// 채팅 삭제
export const deleteChat_Bus = async (chatId) => {
  if (USE_MOCK) {
    console.log("📦 목업 채팅 삭제 요청...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 삭제 완료");
        resolve();
      }, 500);
    });
  }

  const response = await instance.delete(`/business/chat/${chatId}/delete/`);

  if (response.status === 204) {
    console.log("채팅 삭제 성공");
  } else {
    throw new Error("삭제 실패");
  }
};

// 채팅 목록 조회
export const getChatList_Bus = async (userId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            chat_id_play_chem: 123,
            title: "멋사 잡담방",
            people_num: 23,
            uploaded_at: "2025-07-01T12:34:56",
          },
          {
            chat_id_play_chem: 124,
            title: "양재동 패거리",
            people_num: 7,
            uploaded_at: "2025-07-02T09:20:00",
          },
        ]);
      }, 500);
    });
  }

  const response = await instance.get(`/business/chat/${userId}/`);

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("목록 조회 실패");
  }
};

// 분석 요청
export const postAnalyze_Bus = async (chatId, payload) => {
  if (USE_MOCK) {
    console.log("📦 목업 분석 요청...", payload);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 분석 완료");
        resolve({
          result_id_play_chem: 999,
        });
      }, 1000);
    });
  }

  const response = await instance.post(
    `/business/chat/${chatId}/analyze/`,
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
  if (USE_MOCK) {
    console.log("📦 목업 결과 저장 요청...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 결과 저장 완료");
        resolve();
      }, 500);
    });
  }

  const response = await instance.post(`/business/analysis/${resultId}/save/`);

  if (response.status === 204) {
    console.log("결과 저장 성공");
  } else {
    throw new Error("저장 실패");
  }
};

// 분석 목록 조회
export const getAnalysisList_Bus = async (userId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            analysis_date: "2024-07-01T12:00:00",
            title: "업무 대화 분석",
            analysis_type: "케미측정",
            analysis_result: "케미지수 80점",
          },
        ]);
      }, 500);
    });
  }

  const response = await instance.get(`/business/analysis/${userId}/`);

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("분석 목록 조회 실패");
  }
};

// 분석 상세 조회
export const getAnalysisDetail_Bus = async (resultId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          content: "이것은 예시 업무 분석 결과입니다.",
        });
      }, 500);
    });
  }

  const response = await instance.get(`/business/analysis/${resultId}/detail/`);

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("상세 조회 실패");
  }
};

// 분석 결과 삭제
export const deleteAnalysis_Bus = async (resultId) => {
  if (USE_MOCK) {
    console.log("📦 목업 분석 결과 삭제 요청...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ 목업 분석 결과 삭제 완료");
        resolve();
      }, 500);
    });
  }

  const response = await instance.delete(
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
  const response = await instance.put("/me", data);
  if (response.status === 200) {
    console.log("사용자 정보 수정 성공");
    return response.data;
  } else {
    console.log("사용자 정보 수정 에러:", response);
  }
};
