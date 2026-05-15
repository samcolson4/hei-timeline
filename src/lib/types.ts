export type TimelineItem = {
  id: number;
  title: string;
  slug: string;
  url: string;
  air_date: string;
  poster_url: string | null;
  category: string | null;
  season_name: string | null;
  season_number: number | null;
  is_live: boolean;
  is_coming_soon: boolean;
  length: string | null;
  youtube_url: string | null;
};

export type TimelinePayload = {
  generated_at: string;
  items: TimelineItem[];
};
