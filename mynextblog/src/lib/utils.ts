import { format, parse } from 'date-fns';

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '';

  try {
    // 이미 Date 객체인 경우
    if (dateString instanceof Date) {
      return format(dateString, 'yyyy년 MM월 dd일');
    }

    // 문자열로 변환
    const dateStr = String(dateString).trim();

    // Jekyll 형식 처리:
    // 1. "2023-04-15 18:00:00 +0900"
    // 2. "2023-04-15 18:00:00"
    // 3. "2023-04-15"
    let date: Date;

    // 먼저 날짜 부분만 추출 (첫 10자: YYYY-MM-DD)
    const datePart = dateStr.substring(0, 10);

    // 시간 정보가 있는지 확인
    if (dateStr.length > 10 && dateStr.includes(':')) {
      // 시간 정보가 있는 경우
      // "2023-04-15 18:00:00 +0900" 또는 "2023-04-15 18:00:00"에서
      // "2023-04-15 18:00:00" 부분만 추출
      const dateTimePart = dateStr.substring(0, 19); // "YYYY-MM-DD HH:mm:ss"
      date = parse(dateTimePart, 'yyyy-MM-dd HH:mm:ss', new Date());
    } else {
      // "2023-04-15" 형식
      date = parse(datePart, 'yyyy-MM-dd', new Date());
    }

    return format(date, 'yyyy년 MM월 dd일');
  } catch (error) {
    console.error('Date parsing error:', error, dateString);
    // 파싱 실패 시 문자열로 변환 후 날짜 부분만 반환
    const dateStr = String(dateString);
    return dateStr.split(' ')[0] || dateStr;
  }
}

export function normalizeCategory(category: string | string[] | undefined): string[] {
  if (!category) return [];
  if (Array.isArray(category)) return category;
  return [category];
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function getExcerpt(content: string, length: number = 150): string {
  const plainText = content.replace(/[#*`\[\]]/g, '').trim();
  return plainText.length > length
    ? plainText.substring(0, length) + '...'
    : plainText;
}
