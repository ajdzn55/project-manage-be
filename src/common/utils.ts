/* enum에 대한 설명을 하나의 문자열로 만들어 변환하는 함수 */
export const getEnumDescriptionString = (
  enumMap: Record<string, string | number>,
) => {
  return Object.entries(enumMap)
    .map(([key, value]) => {
      return `${key}: ${value}`;
    })
    .join(', ');
};
