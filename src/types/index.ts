export interface AppLink {
  id: string;
  url: string;
  title: string;
  iconUrl: string;
  customIcon: boolean;
  description?: string;
  whatLearned?: string;
  createdAt: string;
  sortOrder: number;
}
