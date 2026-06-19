export type ThemeName = 'light' | 'dark' | 'darkBlue' | 'green' | 'purple' | 'black_and_red' | 'black_and_yellow';

export type Theme = {
  primary: string;
  background: string;
  card: string;
  text: string;
  subtext: string;
  input: string;
  inputBackground: string;
  border: string;
  placeholder: string;
  bubbleMine: string;
  bubbleTheirs: string;
  statusBar: 'dark-content' | 'light-content';
};

export const themes: Record<ThemeName, Theme> = {
  light: {
    primary: '#6C63FF',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#1A1A1A',
    subtext: '#666666',
    input: '#FFFFFF',
    inputBackground: '#F0F0F0',
    border: '#E0E0E0',
    placeholder: '#999999',
    bubbleMine: '#6C63FF',
    bubbleTheirs: '#E0E0E0',
    statusBar: 'dark-content',
  },
  dark: {
    primary: '#6C63FF',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    subtext: '#AAAAAA',
    input: '#2D2D2D',
    inputBackground: '#2D2D2D',
    border: '#444444',
    placeholder: '#666666',
    bubbleMine: '#6C63FF',
    bubbleTheirs: '#2D2D2D',
    statusBar: 'light-content',
  },
  darkBlue: {
    primary: '#1a73e8',
    background: '#0D1B2A',
    card: '#1B2838',
    text: '#E8F0FE',
    subtext: '#8AB4F8',
    input: '#243447',
    inputBackground: '#243447',
    border: '#2D4A6A',
    placeholder: '#5F7FA0',
    bubbleMine: '#1a73e8',
    bubbleTheirs: '#1B2838',
    statusBar: 'light-content',
  },
  green: {
    primary: '#22C55E',
    background: '#0A1A0F',
    card: '#0F2D1A',
    text: '#DCFCE7',
    subtext: '#86EFAC',
    input: '#163824',
    inputBackground: '#163824',
    border: '#166534',
    placeholder: '#4ADE80',
    bubbleMine: '#22C55E',
    bubbleTheirs: '#0F2D1A',
    statusBar: 'light-content',
  },
  purple: {
    primary: '#A855F7',
    background: '#0F0A1E',
    card: '#1A1033',
    text: '#F3E8FF',
    subtext: '#C084FC',
    input: '#2D1B4E',
    inputBackground: '#2D1B4E',
    border: '#581C87',
    placeholder: '#7C3AED',
    bubbleMine: '#A855F7',
    bubbleTheirs: '#1A1033',
    statusBar: 'light-content',
  },
  black_and_red: {
    primary: '#EF4444',
    background: '#000000',
    card: '#111111',
    text: '#FFFFFF',
    subtext: '#AAAAAA',
    input: '#1A1A1A',
    inputBackground: '#1A1A1A',
    border: '#330000',
    placeholder: '#666666',
    bubbleMine: '#EF4444',
    bubbleTheirs: '#1A1A1A',
    statusBar: 'light-content',
  },
  black_and_yellow: {
    primary: '#EAB308',
    background: '#000000',
    card: '#111111',
    text: '#FFFFFF',
    subtext: '#AAAAAA',
    input: '#1A1A1A',
    inputBackground: '#1A1A1A',
    border: '#332200',
    placeholder: '#666666',
    bubbleMine: '#EAB308',
    bubbleTheirs: '#1A1A1A',
    statusBar: 'light-content',
  },
};
