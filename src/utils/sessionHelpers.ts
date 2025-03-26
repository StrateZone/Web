// utils/sessionHelpers.ts
export const saveSearchSession = (
  key: string,
  data: any,
  setTimeoutId?: (id: NodeJS.Timeout) => void
) => {
  const sessionData = {
    ...data,
    _savedAt: Date.now(),
  };

  sessionStorage.setItem(key, JSON.stringify(sessionData));

  // Tự động xóa sau 30 phút
  const timeoutId = setTimeout(
    () => {
      sessionStorage.removeItem(key);
    },
    30 * 60 * 1000
  );

  if (setTimeoutId) {
    setTimeoutId(timeoutId);
  }
};

export const loadSearchSession = (key: string) => {
  const savedData = sessionStorage.getItem(key);
  if (!savedData) return null;

  try {
    const parsedData = JSON.parse(savedData);
    const currentTime = Date.now();
    const sessionAge = currentTime - (parsedData._savedAt || currentTime);

    // Kiểm tra nếu session còn hiệu lực (30 phút)
    if (sessionAge <= 30 * 60 * 1000) {
      return parsedData;
    } else {
      sessionStorage.removeItem(key);
      return null;
    }
  } catch (e) {
    sessionStorage.removeItem(key);
    return null;
  }
};
