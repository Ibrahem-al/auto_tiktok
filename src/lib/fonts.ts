import { FontPreset } from '@/types';

export const FONT_PRESETS: Record<string, FontPreset> = {
  montserrat: {
    id: 'montserrat',
    name: 'Montserrat Bold',
    fontFamily: 'Montserrat',
    fileName: 'Montserrat-Bold.ttf',
    size: 90,
    bold: true,
    outline: 4,
    marginV: 0,
  },
  poppins: {
    id: 'poppins',
    name: 'Poppins SemiBold',
    fontFamily: 'Poppins',
    fileName: 'Poppins-SemiBold.ttf',
    size: 85,
    bold: false,
    outline: 3,
    marginV: 0,
  },
  bebas: {
    id: 'bebas',
    name: 'Bebas Neue',
    fontFamily: 'Bebas Neue',
    fileName: 'BebasNeue-Regular.ttf',
    size: 100,
    bold: false,
    outline: 5,
    marginV: 0,
  },
};

export const DEFAULT_FONT_PRESET = 'montserrat';
