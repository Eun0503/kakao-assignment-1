import { getWeekDays, formatDateString } from '../utils/date';

function WeeklyNavigator({ selectedDate, setSelectedDate, weekStartDate, setWeekStartDate, todos }) {
  const weekDays = getWeekDays(weekStartDate);
  
  // 연도/월 헤더 업데이트
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const monthText = `${year}년 ${month}월`;

  const daysKo = ['월', '화', '수', '목', '금', '토', '일'];
  const todayStr = formatDateString(new Date());
  const selectedStr = formatDateString(selectedDate);

  // 주차 이동 헬퍼 함수
  const shiftWeek = (offsetDays) => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + offsetDays);
    setWeekStartDate(newDate);
  };

  return (
    <div className="weekly-navigator flex flex-col mb-6">
      {/* 주간 네비게이터 헤더 */}
      <div className="week-header flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => shiftWeek(-7)}
          className="nav-btn bg-slate-50 border border-slate-200 text-slate-500 w-8 h-8 rounded-lg text-sm font-semibold cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-slate-200 hover:text-slate-800 active:scale-95 select-none"
          aria-label="이전 주"
        >
          &lt;
        </button>
        <span className="text-base font-bold text-slate-800 select-none">
          {monthText}
        </span>
        <button
          type="button"
          onClick={() => shiftWeek(7)}
          className="nav-btn bg-slate-50 border border-slate-200 text-slate-500 w-8 h-8 rounded-lg text-sm font-semibold cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-slate-200 hover:text-slate-800 active:scale-95 select-none"
          aria-label="다음 주"
        >
          &gt;
        </button>
      </div>

      {/* 날짜 카드 목록 */}
      <div className="week-days-container flex gap-1.5 justify-between">
        {weekDays.map((day, index) => {
          const dayStr = formatDateString(day);
          const isSelected = dayStr === selectedStr;
          const isToday = dayStr === todayStr;

          // 해당 날짜의 전체 할 일 개수 계산
          const todoCountForDay = todos.filter((todo) => todo.date === dayStr).length;

          // 스타일 분기 처리
          let cardClass = "flex-1 flex flex-col items-center py-2.5 px-0.5 border-2 rounded-[10px] cursor-pointer transition-all duration-200 ease-in-out select-none hover:-translate-y-0.5";
          let labelClass = "text-[11px] font-medium mb-1";
          let numberClass = "text-sm font-semibold";
          let countClass = "text-[9px] font-bold rounded-[10px] py-0.5 px-1.5 mt-1.5 min-w-[16px] text-center";

          if (isSelected) {
            cardClass += " bg-brand border-brand hover:border-brand";
            labelClass += " text-white/70";
            numberClass += " text-white";
            countClass += " text-brand bg-white";
          } else if (isToday) {
            cardClass += " bg-violet-50 border-2 border-violet-400 hover:border-violet-500";
            labelClass += " text-slate-500";
            numberClass += " text-brand font-bold";
            countClass += " text-white bg-violet-400";
          } else {
            cardClass += " bg-white border-slate-200 hover:border-slate-400";
            labelClass += " text-slate-500";
            numberClass += " text-slate-800";
            countClass += " text-white bg-slate-400";
          }

          return (
            <div
              key={dayStr}
              onClick={() => {
                setSelectedDate(day);
              }}
              className={cardClass}
            >
              <span className={labelClass}>{daysKo[index]}</span>
              <span className={numberClass}>{day.getDate()}</span>
              <span className={countClass}>{todoCountForDay}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyNavigator;
