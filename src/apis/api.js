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

export const postChat = async (userId, file) => {
  const formData = new FormData();
  formData.append("user_id", userId);
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
    const response = await instanceWithToken.delete(
      `/play/chat/${chatId}/delete/`
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

export const getChatList = async () => {
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
    const response = await instanceWithToken.post(
      `/play/chat/${chatId}/analyze/`,
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
    const response = await instanceWithToken.get(`/play/analysis/`);
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
    const response = await instanceWithToken.get(
      `/play/analysis/${resultId}/detail/`
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
    const response = await instanceWithToken.delete(
      `/play/analysis/${resultId}/detail/`
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

  const response = await instanceWithToken.post("/business/chat/", formData, {
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

  const response = await instanceWithToken.delete(
    `/business/chat/${chatId}/delete/`
  );

  if (response.status === 204) {
    console.log("채팅 삭제 성공");
  } else {
    throw new Error("삭제 실패");
  }
};

// 채팅 목록 조회
export const getChatList_Bus = async () => {
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

  const response = await instanceWithToken.get(`/business/chat/`);

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
  const response = await instanceWithToken.post(
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

  const response = await instanceWithToken.get(`/business/analysis/`);

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
