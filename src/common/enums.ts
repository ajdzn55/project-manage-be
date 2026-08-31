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

export enum MemberRole {
  Owner = 'OWNER',
  Member = 'MEMBER',
}

export const memberRoleDesc = {
  [MemberRole.Owner]: '관리자',
  [MemberRole.Member]: '참여자',
};
