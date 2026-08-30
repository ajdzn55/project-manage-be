export enum ProjectStatus {
  Planned = 'PLANNED',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

export const projectStatusDesc = {
  [ProjectStatus.Planned]: '계획',
  [ProjectStatus.InProgress]: '진행',
  [ProjectStatus.Completed]: '완료',
};
