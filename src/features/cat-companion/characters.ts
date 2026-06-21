export interface CharacterTheme {
  light: Record<string, string>
  dark: Record<string, string>
}

export interface Character {
  id: string
  name: string
  cover: string
  hasRightKeys: boolean
  keyCount: { left: number; right: number }
  theme: CharacterTheme
}

export const characters: Character[] = [
  {
    id: 'classic',
    name: 'Classic Cat',
    cover: '/characters/classic/cover.png',
    hasRightKeys: true,
    keyCount: { left: 3, right: 4 },
    theme: {
      light: {
        primary: '#1a1a1a', 'on-primary': '#ffffff', 'primary-container': '#e8e8e8',
        'on-primary-container': '#1a1a1a', secondary: '#505f76', 'secondary-container': '#d0e1fb',
        'on-secondary-container': '#3a4a60', tertiary: '#6a7a6a', 'tertiary-container': '#d0e0d0',
        'on-tertiary-container': '#2a3a2a', surface: '#f5f5f5', 'surface-dim': '#e0e0e0',
        'surface-bright': '#ffffff', 'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f0f0f0', 'surface-container': '#e8e8e8',
        'surface-container-high': '#e0e0e0', 'surface-container-highest': '#d8d8d8',
        'on-surface': '#1a1a1a', 'on-surface-variant': '#5a5a5a',
        outline: '#8a8a8a', 'outline-variant': '#c8c8c8',
        error: '#ba1a1a', 'on-error': '#ffffff', 'error-container': '#ffdad6',
      },
      dark: {
        primary: '#e0e0e0', 'on-primary': '#1a1a1a', 'primary-container': '#3a3a3a',
        'on-primary-container': '#e0e0e0', secondary: '#a0b4cc', 'secondary-container': '#2a3a4a',
        'on-secondary-container': '#c0d8f0', tertiary: '#90b090', 'tertiary-container': '#1a2a1a',
        'on-tertiary-container': '#b0d0b0', surface: '#141414', 'surface-dim': '#0a0a0a',
        'surface-bright': '#1e1e1e', 'surface-container-lowest': '#0a0a0a',
        'surface-container-low': '#1a1a1a', 'surface-container': '#222222',
        'surface-container-high': '#2a2a2a', 'surface-container-highest': '#333333',
        'on-surface': '#e0e0e0', 'on-surface-variant': '#a0a0a0',
        outline: '#6a6a6a', 'outline-variant': '#3a3a3a',
        error: '#ff6b6b', 'on-error': '#1a1a1a', 'error-container': '#3a1a1a',
      },
    },
  },
  {
    id: 'xiaohei',
    name: 'Luo Xiaohei',
    cover: '/characters/xiaohei/cover.png',
    hasRightKeys: false,
    keyCount: { left: 40, right: 0 },
    theme: {
      light: {
        primary: '#2d2d2d', 'on-primary': '#ffffff', 'primary-container': '#e0e0e0',
        'on-primary-container': '#1a1a1a', secondary: '#4a6fa5', 'secondary-container': '#d0e0f8',
        'on-secondary-container': '#2a4a7a', tertiary: '#5a7a8a', 'tertiary-container': '#d0e0e8',
        'on-tertiary-container': '#1a3a4a', surface: '#f0f2f5', 'surface-dim': '#dcdfe5',
        'surface-bright': '#ffffff', 'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eef0f3', 'surface-container': '#e6e8ec',
        'surface-container-high': '#dde0e5', 'surface-container-highest': '#d4d7dc',
        'on-surface': '#1a1c20', 'on-surface-variant': '#4a4c50',
        outline: '#7a7c80', 'outline-variant': '#c4c6ca',
        error: '#ba1a1a', 'on-error': '#ffffff', 'error-container': '#ffdad6',
      },
      dark: {
        primary: '#c0d0e0', 'on-primary': '#0a1a2a', 'primary-container': '#2a3a4a',
        'on-primary-container': '#d0e0f0', secondary: '#7aa0cc', 'secondary-container': '#1a2a3a',
        'on-secondary-container': '#90b8e0', tertiary: '#80a0b0', 'tertiary-container': '#1a2a30',
        'on-tertiary-container': '#a0c0d0', surface: '#0c0e12', 'surface-dim': '#060808',
        'surface-bright': '#161820', 'surface-container-lowest': '#060808',
        'surface-container-low': '#121418', 'surface-container': '#1a1c22',
        'surface-container-high': '#222428', 'surface-container-highest': '#2a2c30',
        'on-surface': '#d0d2d6', 'on-surface-variant': '#a0a2a6',
        outline: '#6a6c70', 'outline-variant': '#3a3c40',
        error: '#ff6b6b', 'on-error': '#1a1a1a', 'error-container': '#3a1a1a',
      },
    },
  },
  {
    id: 'elysia',
    name: 'Elysia',
    cover: '/characters/elysia/cover.png',
    hasRightKeys: false,
    keyCount: { left: 25, right: 0 },
    theme: {
      light: {
        primary: '#d4637a', 'on-primary': '#ffffff', 'primary-container': '#fcd0d8',
        'on-primary-container': '#8a2040', secondary: '#7c5cbf', 'secondary-container': '#e0d0f8',
        'on-secondary-container': '#5a3a9a', tertiary: '#e8a0bf', 'tertiary-container': '#f8e0f0',
        surface: '#fdf5f8', 'surface-container-lowest': '#ffffff',
      },
      dark: {
        primary: '#f0a0b8', 'on-primary': '#3a1020', 'primary-container': '#6a2040',
        'on-primary-container': '#ffc0d0', secondary: '#b890e0', 'secondary-container': '#3a2a5a',
        'on-secondary-container': '#d0b8f0', tertiary: '#e0a0c0', 'tertiary-container': '#4a2a40',
        surface: '#1a1018', 'surface-container-lowest': '#0f0a0c',
      },
    },
  },
  {
    id: 'haohao',
    name: 'Red Panda',
    cover: '/characters/haohao/cover.png',
    hasRightKeys: true,
    keyCount: { left: 28, right: 32 },
    theme: {
      light: {
        primary: '#c75b39', 'on-primary': '#ffffff', 'primary-container': '#fdd0c0',
        'on-primary-container': '#7a2a10', secondary: '#5a8a3c', 'secondary-container': '#d0f0c0',
        'on-secondary-container': '#3a6a20', tertiary: '#d4a04a', 'tertiary-container': '#f8e8c0',
        surface: '#fdf8f3', 'surface-container-lowest': '#ffffff',
      },
      dark: {
        primary: '#e89070', 'on-primary': '#2a1005', 'primary-container': '#7a3020',
        'on-primary-container': '#f0b8a0', secondary: '#90c070', 'secondary-container': '#2a4a18',
        'on-secondary-container': '#b0d890', tertiary: '#d4a860', 'tertiary-container': '#5a4a20',
        surface: '#1a1510', 'surface-container-lowest': '#0f0a05',
      },
    },
  },
  {
    id: 'nailin',
    name: 'Nailin',
    cover: '/characters/nailin/cover.png',
    hasRightKeys: true,
    keyCount: { left: 28, right: 32 },
    theme: {
      light: {
        primary: '#6b4c8a', 'on-primary': '#ffffff', 'primary-container': '#e0d0f0',
        'on-primary-container': '#4a2a6a', secondary: '#c47a9a', 'secondary-container': '#f8d8e8',
        'on-secondary-container': '#8a3a5a', tertiary: '#8b6faa', 'tertiary-container': '#e8d8f8',
        surface: '#f8f3fb', 'surface-container-lowest': '#ffffff',
      },
      dark: {
        primary: '#b890d0', 'on-primary': '#1a0a2a', 'primary-container': '#4a2a6a',
        'on-primary-container': '#d8c0f0', secondary: '#e0a0c0', 'secondary-container': '#4a2a3a',
        'on-secondary-container': '#f0c0d8', tertiary: '#a888c0', 'tertiary-container': '#3a2a4a',
        surface: '#15101a', 'surface-container-lowest': '#0a050f',
      },
    },
  },
  {
    id: 'suxin',
    name: 'Suxin',
    cover: '/characters/suxin/cover.png',
    hasRightKeys: false,
    keyCount: { left: 55, right: 0 },
    theme: {
      light: {
        primary: '#3a7a7a', 'on-primary': '#ffffff', 'primary-container': '#c8e8e8',
        'on-primary-container': '#1a5a5a', secondary: '#5a9a6a', 'secondary-container': '#d0f0d8',
        'on-secondary-container': '#3a7a4a', tertiary: '#4a8a8a', 'tertiary-container': '#d0e8e8',
        surface: '#f3f8f8', 'surface-container-lowest': '#ffffff',
      },
      dark: {
        primary: '#80c0c0', 'on-primary': '#0a2a2a', 'primary-container': '#2a5a5a',
        'on-primary-container': '#a0e0e0', secondary: '#90c8a0', 'secondary-container': '#1a3a20',
        'on-secondary-container': '#b0e8c0', tertiary: '#80b0b0', 'tertiary-container': '#1a3a3a',
        surface: '#0a1515', 'surface-container-lowest': '#050a0a',
      },
    },
  },
  {
    id: 'anhe',
    name: 'Anhe',
    cover: '/characters/anhe/cover.png',
    hasRightKeys: false,
    keyCount: { left: 18, right: 0 },
    theme: {
      light: {
        primary: '#d4a04a', 'on-primary': '#ffffff', 'primary-container': '#f8e8c0',
        'on-primary-container': '#7a5a10', secondary: '#8a6a3a', 'secondary-container': '#f0e0c0',
        'on-secondary-container': '#6a4a1a', tertiary: '#c49040', 'tertiary-container': '#f0e0c0',
        surface: '#fdf8f0', 'surface-container-lowest': '#ffffff',
      },
      dark: {
        primary: '#e0b870', 'on-primary': '#2a1a05', 'primary-container': '#6a4a18',
        'on-primary-container': '#f0d890', secondary: '#c0a060', 'secondary-container': '#3a2a10',
        'on-secondary-container': '#e0c880', tertiary: '#d0a858', 'tertiary-container': '#4a3a18',
        surface: '#1a1508', 'surface-container-lowest': '#0f0a03',
      },
    },
  },
  {
    id: 'guizhong',
    name: 'Guizhong',
    cover: '/characters/guizhong/cover.png',
    hasRightKeys: false,
    keyCount: { left: 39, right: 0 },
    theme: {
      light: {
        primary: '#5a7a9a', 'on-primary': '#ffffff', 'primary-container': '#d0e0f0',
        'on-primary-container': '#3a5a7a', secondary: '#7a9aaa', 'secondary-container': '#d8e8f0',
        'on-secondary-container': '#5a7a9a', tertiary: '#6a8a9a', 'tertiary-container': '#d0e0e8',
        surface: '#f3f5f8', 'surface-container-lowest': '#ffffff',
      },
      dark: {
        primary: '#90b8d0', 'on-primary': '#0a1a2a', 'primary-container': '#2a4a6a',
        'on-primary-container': '#b0d0e8', secondary: '#a0c0d0', 'secondary-container': '#1a2a3a',
        'on-secondary-container': '#c0d8e8', tertiary: '#90b0c0', 'tertiary-container': '#1a2a3a',
        surface: '#0a0f15', 'surface-container-lowest': '#05080a',
      },
    },
  },
  {
    id: 'zimin',
    name: 'Zimin',
    cover: '/characters/zimin/cover.png',
    hasRightKeys: false,
    keyCount: { left: 15, right: 0 },
    theme: {
      light: {
        primary: '#4a8a5a', 'on-primary': '#ffffff', 'primary-container': '#d0f0d8',
        'on-primary-container': '#2a6a3a', secondary: '#6aaa7a', 'secondary-container': '#d8f0e0',
        'on-secondary-container': '#4a8a5a', tertiary: '#5a9a6a', 'tertiary-container': '#d0e8d8',
        surface: '#f3f8f5', 'surface-container-lowest': '#ffffff',
      },
      dark: {
        primary: '#80c090', 'on-primary': '#0a2a10', 'primary-container': '#2a5a30',
        'on-primary-container': '#a0e0b0', secondary: '#a0d0b0', 'secondary-container': '#1a3a20',
        'on-secondary-container': '#c0e8d0', tertiary: '#90c0a0', 'tertiary-container': '#1a3a28',
        surface: '#0a150f', 'surface-container-lowest': '#050a08',
      },
    },
  },
]

export function getCharacter(id: string): Character {
  return characters.find((c) => c.id === id) || characters[0]
}

export function applyCharacterTheme(characterId: string, isDark: boolean) {
  const character = getCharacter(characterId)
  const palette = isDark ? character.theme.dark : character.theme.light
  const root = document.documentElement

  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
}

export function clearCharacterTheme() {
  const root = document.documentElement
  const keys = [
    'primary', 'on-primary', 'primary-container', 'on-primary-container',
    'secondary', 'secondary-container', 'on-secondary-container',
    'tertiary', 'tertiary-container', 'surface', 'surface-container-lowest',
  ]
  keys.forEach((key) => {
    root.style.removeProperty(`--color-${key}`)
  })
}