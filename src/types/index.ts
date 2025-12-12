export interface SiteItem {
  name: string;
  url: string;
  desc?: string;
  icon?: string;
  tags?: string[]; // 支持标签
}

export interface Category {
  id: string;
  title: string;
  icon?: string;
  items: SiteItem[];
}