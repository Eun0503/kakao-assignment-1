/**
 * Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환하는 헬퍼 함수
 */
export function formatDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 전달받은 날짜의 주간 월요일(주간 시작일)을 계산하는 함수
 */
export function getMonday(dateObj) {
  const date = new Date(dateObj);
  const day = date.getDay();
  // 일요일(0)이면 6일 전으로, 그 외요일은 월요일(1) 기준 오프셋만큼 전으로 이동
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

/**
 * 월요일부터 7일간의 Date 객체 배열을 구하는 함수
 */
export function getWeekDays(mondayObj) {
  return Array.from({ length: 7 }, (_, i) => {
    const tempDate = new Date(mondayObj);
    tempDate.setDate(mondayObj.getDate() + i);
    return tempDate;
  });
}
