
export interface Wallpaper {
  id: string;
  url: string;
  title: string;
  category: string;
}

export enum AppMode {
  EXPLORE = 'explore',
  EDIT = 'edit',
  ANIMATE = 'animate',
  VOICE = 'voice'
}

export interface ProcessingState {
  loading: boolean;
  message: string;
}
