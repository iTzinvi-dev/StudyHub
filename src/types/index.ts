export type TabType = 'lounge' | 'environment' | 'mentor' | 'quizzes' | 'leaderboard' | 'profile';

export type AvatarId = 'boy1' | 'boy2' | 'girl1' | 'girl2';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  gender: 'male' | 'female' | 'non-binary';
  avatarId: AvatarId;
  status: string;
  streak: number;
  freezeTickets: number;
  totalFocusHours: number;
  dailyGoalHours: number;
  todayMinutes: number;
  createdAt: string;
}

export interface RoomMember {
  id: string;
  name: string;
  avatarId: AvatarId;
  status: string;
  isAfk: boolean;
  focusMinutesToday: number;
  isSelf?: boolean;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  isPrivate: boolean;
  memberCount: number;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSet {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface AudioVolumes {
  rain: number;
  fire: number;
  music: number;
  master: number;
}

export type VisualThemeId = 'zenith' | 'amber' | 'moss' | 'nordic' | 'espresso';

export interface VisualTheme {
  id: VisualThemeId;
  name: string;
  subtitle: string;
  bg: string;
  surface: string;
  surfaceElevated: string;
  cream: string;
  muted: string;
  gold: string;
  border: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export type BackgroundSceneId = 'study-desk' | 'bonfire-hearth';

export interface SoundscapeTrack {
  id: string;
  title: string;
  category: 'Rain & Storm' | 'Nature & Wild' | 'Cozy & Library' | 'Meditation';
  youtubeUrl: string;
  description: string;
  badge: string;
  durationLabel: string;
}

