import { instance, instanceWithToken } from "./axios";

/**
 * ✅ 인증 관련
 */

// 로그인
export const login = async (data) => {
  const response = await instance.post("/login", data);
  if (response.status === 200) {
    console.log("로그인 성공");
    window.location.href = "/";
  } else {
    console.log("로그인 에러:", response);
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
  const response = await instanceWithToken.get("/me");
  if (response.status === 200) {
    return response.data;
  } else {
    console.log("사용자 정보 조회 에러:", response);
  }
};

/**
 * ✅ 파일 업로드 및 관리
 */

export const uploadFile = async (formData) => {
  const response = await instanceWithToken.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (response.status === 201) {
    console.log("파일 업로드 성공");
    return response.data;
  } else {
    console.log("파일 업로드 에러:", response);
  }
};

export const getFiles = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "멋사 잡담방", participant_count: 23 },
        { id: 2, title: "양재동 패거리", participant_count: 7 },
        { id: 3, title: "준영이", participant_count: 2 },
      ]);
    }, 500);
  });
};

export const deleteFile = async (fileId) => {
  const response = await instanceWithToken.delete(`/files/${fileId}`);
  if (response.status === 204) {
    console.log("파일 삭제 성공");
  } else {
    console.log("파일 삭제 에러:", response);
  }
};

/**
 * ✅ 분석 결과
 */

export const analyze = async (data) => {
  const response = await instanceWithToken.post("/analyze", data);
  if (response.status === 200) {
    console.log("분석 성공");
    return response.data;
  } else {
    console.log("분석 에러:", response);
  }
};

export const getAnalyses = async () => {
  const response = await instanceWithToken.get("/analyses");
  if (response.status === 200) {
    return response.data;
  } else {
    console.log("분석 목록 조회 에러:", response);
  }
};

export const getAnalysisDetail = async (analysisId) => {
  const response = await instanceWithToken.get(`/analyses/${analysisId}`);
  if (response.status === 200) {
    return response.data;
  } else {
    console.log("분석 상세 조회 에러:", response);
  }
};

/**
 * ✅ 크레딧 관리
 */

export const getCredits = async () => {
  const response = await instanceWithToken.get("/credits");
  if (response.status === 200) {
    return response.data;
  } else {
    console.log("크레딧 조회 에러:", response);
  }
};

export const chargeCredits = async (data) => {
  const response = await instanceWithToken.post("/credits/charge", data);
  if (response.status === 200) {
    console.log("크레딧 충전 성공");
    return response.data;
  } else {
    console.log("크레딧 충전 에러:", response);
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
