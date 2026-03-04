import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Library,
  MessageCircle,
  Menu,
  Minimize2,
  Mic2,
  Moon,
  Pause,
  Play,
  Radio,
  RotateCcw,
  RotateCw,
  Search,
  Send,
  Share2,
  Sun,
  Upload,
  UserRound,
  Volume2,
  VolumeX,
} from 'lucide-react'
import logoRadio from '../logoradio1.png'
import { SUPABASE_EPISODES_BUCKET, supabase } from './lib/supabase'
import './App.css'

const DEFAULT_PRIMARY_STREAM_URL = 'https://radio.turadiolatina.com/live'
const DEFAULT_FALLBACK_STREAM_URL = 'http://31.97.168.251:8000/live'
const RAW_STREAM_URL = import.meta.env.VITE_STREAM_URL || DEFAULT_PRIMARY_STREAM_URL
const RAW_FALLBACK_STREAM_URL = import.meta.env.VITE_STREAM_FALLBACK_URL || DEFAULT_FALLBACK_STREAM_URL
const STREAM_PROXY_PATH = import.meta.env.VITE_STREAM_PROXY_PATH || '/stream-live'
const IS_ABSOLUTE_STREAM_URL = RAW_STREAM_URL.startsWith('http://') || RAW_STREAM_URL.startsWith('https://')
const IS_HTTPS_PAGE = typeof window !== 'undefined' && window.location.protocol === 'https:'
const IS_STREAM_DEBUG_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEBUG_STREAM === 'true'

const resolvePlayableStreamUrl = (rawUrl) => {
  if (!rawUrl) return ''

  const isAbsoluteStreamUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
  if (!isAbsoluteStreamUrl) return rawUrl

  if (IS_HTTPS_PAGE && rawUrl.startsWith('http://')) {
    return STREAM_PROXY_PATH
  }

  return rawUrl
}

const STREAM_STATUS_URL =
  import.meta.env.VITE_STREAM_STATUS_URL ||
  (IS_HTTPS_PAGE && IS_ABSOLUTE_STREAM_URL && RAW_STREAM_URL.startsWith('http://')
    ? '/stream-status'
    : IS_ABSOLUTE_STREAM_URL
      ? RAW_STREAM_URL.replace(/\/live(?:\?.*)?$/, '/status-json.xsl')
      : '/stream-status')
const STREAM_MOUNT_PATH = (() => {
  try {
    return new URL(RAW_STREAM_URL, 'http://localhost').pathname || '/live'
  } catch {
    return '/live'
  }
})()
const STREAM_URLS = Array.from(
  new Set([resolvePlayableStreamUrl(RAW_STREAM_URL), resolvePlayableStreamUrl(RAW_FALLBACK_STREAM_URL)].filter(Boolean)),
)
const STREAM_URL = STREAM_URLS[0] || '/live'
const DEFAULT_PLAYER_COVER_IMAGE = '/img/player-cover.svg'
const THEME_STORAGE_KEY = 'tu-radio-latina-theme'
const EDITABLE_CONTENT_STORAGE_KEY = 'tu-radio-latina-editable-content'
const SCHEDULE_DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const sanitizeStorageFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return ''

  return fileName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
}

const getTodayScheduleDayId = () => {
  const weekday = new Date().getDay()
  const mondayFirstIndex = (weekday + 6) % 7
  return SCHEDULE_DAY_ORDER[mondayFirstIndex]
}

const continueListening = [
  {
    id: 1,
    episode: 'EP : 321',
    title: 'The Ultimate Fashion Playground',
    host: 'Max Podcast',
    progress: 80,
    cover:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80',
  },
  {
    id: 2,
    episode: 'EP : 204',
    title: 'Ritmos que conectan Latinoamérica',
    host: 'Tu Radio Latina',
    progress: 46,
    cover:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=320&q=80',
  },
  {
    id: 3,
    episode: 'EP : 187',
    title: 'Noches Urbanas: reggaetón, perreo y clásicos',
    host: 'Cabina Latina Live',
    progress: 22,
    cover:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=320&q=80',
  },
  {
    id: 4,
    episode: 'EP : 402',
    title: 'Conexión Latina: historias de barrio y comunidad',
    host: 'Tu Radio Latina',
    progress: 12,
    cover:
      'https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=320&q=80',
  },
]

const recommended = [
  {
    id: 1,
    episode: 'EP : 024',
    title: 'Profitable Strategies Unleashed',
    host: 'Dianne Analytics',
    cover:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=280&q=80',
  },
  {
    id: 2,
    episode: 'EP : 099',
    title: 'Noches de Salsa & Bachata Sessions',
    host: 'Tu Radio Latina',
    cover:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=280&q=80',
  },
  {
    id: 3,
    episode: 'EP : 145',
    title: 'Voces del Bronx: cultura, música y comunidad',
    host: 'Cabina Latina Live',
    cover:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=280&q=80',
  },
  {
    id: 4,
    episode: 'EP : 211',
    title: 'Ruta Caribe: historias, ritmo y tradición',
    host: 'Tu Radio Latina',
    cover:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=280&q=80',
  },
  {
    id: 5,
    episode: 'EP : 276',
    title: 'Latino Mix Sessions: éxitos de ayer y hoy',
    host: 'Tu Radio Latina',
    cover:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=280&q=80',
  },
]

const hostsContent = {
  es: {
    title: 'Locutores',
    featuredBadge: 'Locutor Principal',
    featuredBadges: ['En Vivo', 'Certificado'],
    featured: {
      name: 'Daniel “El Ritmo” Morales',
      role: 'Host principal · Prime Time',
      description:
        'Conduce el bloque central con entrevistas, música en tendencia y conexión en vivo con la audiencia latina.',
      image:
        'https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?auto=format&fit=crop&w=900&q=80',
    },
    secondary: [
      {
        id: 1,
        name: 'Sofía Cruz',
        role: 'Morning Show',
        description: 'Información local, noticias del barrio y buena vibra para arrancar el día.',
        image:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 2,
        name: 'Kevin Rivera',
        role: 'Mix Urbano',
        description: 'Set urbano en vivo con estrenos, clásicos y participación del chat.',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 3,
        name: 'Valentina Reyes',
        role: 'Podcast & Cultura',
        description: 'Historias de comunidad, cultura latina y conversaciones especiales.',
        image:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80',
      },
    ],
  },
  en: {
    title: 'Hosts',
    featuredBadge: 'Main Host',
    featuredBadges: ['Live', 'Certified'],
    featured: {
      name: 'Daniel “The Rhythm” Morales',
      role: 'Main host · Prime Time',
      description:
        'Leads the main block with interviews, trending music and live connection with the latino audience.',
      image:
        'https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?auto=format&fit=crop&w=900&q=80',
    },
    secondary: [
      {
        id: 1,
        name: 'Sofia Cruz',
        role: 'Morning Show',
        description: 'Local updates, neighborhood news and good vibes to start the day.',
        image:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 2,
        name: 'Kevin Rivera',
        role: 'Urban Mix',
        description: 'Live urban set with fresh releases, classics and chat participation.',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 3,
        name: 'Valentina Reyes',
        role: 'Podcast & Culture',
        description: 'Community stories, latino culture and special conversations.',
        image:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80',
      },
    ],
  },
}

const copy = {
  es: {
    podcastPlayer: 'Reproductor',
    lyrics: 'Letras',
    enjoyTop: 'Disfruta los mejores podcasts',
    heroTitle: 'Escucha tu podcast favorito',
    openPlayer: 'Abrir player',
    playNow: 'Reproducir ahora',
    enVivo: 'En vivo',
    escuchar: 'Escuchar',
    liveTag: 'En vivo',
    liveNow: 'Escucha Tu Radio Latina ahora',
    menu: 'Menú',
    seeAll: 'Ver todo',
    programacion: 'Programación',
    horarios: 'Horarios',
    shows: 'Shows',
    locutores: 'Locutores',
    eventos: 'Eventos especiales',
    horariosMobile: 'Mañana, tarde y noche',
    showsMobile: 'Música, entrevistas y live sets',
    locutoresMobile: 'Voces latinas en cabina',
    eventosMobile: 'Coberturas y transmisiones',
    horariosDesk: 'Lunes a domingo, 24/7',
    showsDesk: 'Morning, drive time y noches',
    locutoresDesk: 'Equipo en vivo y DJs invitados',
    eventosDesk: 'Coberturas y festivales latinos',
    biblioteca: 'Biblioteca',
    podcasts: 'Podcasts',
    contacto: 'Contacto',
    pauseLive: 'Pausar en vivo',
    playLive: 'Reproducir en vivo',
    pausePodcast: 'Pausar podcast',
    playPodcast: 'Reproducir podcast',
    pauseEpisode: 'Pausar episodio',
    playEpisode: 'Reproducir episodio',
    statusConnecting: 'Conectando…',
    statusLive: 'En vivo',
    statusPodcast: 'Escuchando podcast',
    statusLibraryEpisode: 'Escuchando episodio',
    statusError: 'Error de señal',
    nowPlaying: 'Sonando ahora',
    footerDescription: 'Música y podcasts latinos, en vivo para acompañarte todo el día.',
    enlaces: 'Sitemap',
    inicio: 'Inicio',
    comoFunciona: 'Cómo funciona',
    faqs: 'FAQs',
    legalRedes: 'Legal y redes',
    politica: 'Política de privacidad',
    terminos: 'Términos y condiciones',
    publicidad: 'Publicidad',
    colaboraciones: 'Colaboraciones',
    derechos: 'Todos los derechos reservados.',
    footerLine: 'Diseñado para acompañarte con música latina 24/7.',
    liveChat: 'Chat en vivo',
    joinChat: 'Entra al chat y comenta durante la transmisión.',
    tuNombre: 'Tu nombre',
    escribeMensaje: 'Escribe tu mensaje…',
    enviar: 'Enviar',
    usuarioAnonimo: 'Oyente',
    mute: 'Silenciar',
    unmute: 'Activar sonido',
    volumen: 'Volumen',
    ahoraCabina: 'Ahora en cabina',
    enVivoBadge: 'EN VIVO',
    proximoBadge: 'Próximo programa',
    episodioBadge: 'Episodio disponible',
    escucharAhora: 'Escuchar ahora',
    escucharEpisodio: 'Escuchar episodio',
    verProgramacion: 'Ver programación',
    autoplayOn: 'Autoplay ON',
    autoplayOff: 'Autoplay OFF',
    compartir: 'Compartir',
    reproducir: 'Reproducir',
    reproduciendo: 'Reproduciendo',
    podcastBadge: 'Podcast',
    libraryEpisodeBadge: 'Episodio',
    expandir: 'Expandir',
    minimizar: 'Minimizar',
    scheduleByDay: 'Horarios por día',
    chooseDay: 'Elige un día',
  },
  en: {
    podcastPlayer: 'Player',
    lyrics: 'Lyrics',
    enjoyTop: 'Enjoy top podcasts',
    heroTitle: 'Listen to your favorite podcast',
    openPlayer: 'Open player',
    playNow: 'Play now',
    enVivo: 'Live',
    escuchar: 'Listen',
    liveTag: 'Live',
    liveNow: 'Listen to Tu Radio Latina now',
    menu: 'Menu',
    seeAll: 'See all',
    programacion: 'Schedule',
    horarios: 'Hours',
    shows: 'Shows',
    locutores: 'Hosts',
    eventos: 'Special events',
    horariosMobile: 'Morning, afternoon and night',
    showsMobile: 'Music, interviews and live sets',
    locutoresMobile: 'Latino voices on air',
    eventosMobile: 'Covers and special broadcasts',
    horariosDesk: 'Monday to Sunday, 24/7',
    showsDesk: 'Morning, drive time and nights',
    locutoresDesk: 'Live team and guest DJs',
    eventosDesk: 'Covers and latino festivals',
    biblioteca: 'Library',
    podcasts: 'Podcasts',
    contacto: 'Contact',
    pauseLive: 'Pause live',
    playLive: 'Play live',
    pausePodcast: 'Pause podcast',
    playPodcast: 'Play podcast',
    pauseEpisode: 'Pause episode',
    playEpisode: 'Play episode',
    statusConnecting: 'Connecting…',
    statusLive: 'Live',
    statusPodcast: 'Listening to podcast',
    statusLibraryEpisode: 'Listening to episode',
    statusError: 'Signal error',
    nowPlaying: 'Now playing',
    footerDescription: 'Latino music and podcasts live to stay with you all day.',
    enlaces: 'Sitemap',
    inicio: 'Home',
    comoFunciona: 'How it works',
    faqs: 'FAQs',
    legalRedes: 'Legal & social',
    politica: 'Privacy policy',
    terminos: 'Terms and conditions',
    publicidad: 'Advertising',
    colaboraciones: 'Collaborations',
    derechos: 'All rights reserved.',
    footerLine: 'Designed to keep you connected with latino music 24/7.',
    liveChat: 'Live chat',
    joinChat: 'Join the chat and comment during the live show.',
    tuNombre: 'Your name',
    escribeMensaje: 'Write your message…',
    enviar: 'Send',
    usuarioAnonimo: 'Listener',
    mute: 'Mute',
    unmute: 'Unmute',
    volumen: 'Volume',
    ahoraCabina: 'Now in studio',
    enVivoBadge: 'LIVE',
    proximoBadge: 'Upcoming show',
    episodioBadge: 'Episode available',
    escucharAhora: 'Listen now',
    escucharEpisodio: 'Listen to episode',
    verProgramacion: 'View schedule',
    autoplayOn: 'Autoplay ON',
    autoplayOff: 'Autoplay OFF',
    compartir: 'Share',
    reproducir: 'Play',
    reproduciendo: 'Playing',
    podcastBadge: 'Podcast',
    libraryEpisodeBadge: 'Episode',
    expandir: 'Expand',
    minimizar: 'Minimize',
    scheduleByDay: 'Daily schedule',
    chooseDay: 'Choose a day',
  },
}

function App() {
  const audioRef = useRef(null)
  const streamIndexRef = useRef(0)
  const isRecoveringStreamRef = useRef(false)
  const isStartingPlaybackRef = useRef(false)
  const hasFirstInteractionPlaybackRef = useRef(false)
  const episodeAudioInputRefs = useRef({})
  const uploadedEpisodeAudioUrlsRef = useRef([])
  const uploadSuccessTimeoutRef = useRef(null)
  const mobileInicioSectionRef = useRef(null)
  const mobileProgramacionSectionRef = useRef(null)
  const mobileBibliotecaSectionRef = useRef(null)
  const mobileLocutoresSectionRef = useRef(null)
  const mobilePodcastsSectionRef = useRef(null)
  const mobileContactoSectionRef = useRef(null)
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(true)
  const [isPlayerSticky] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isSliderAutoplay, setIsSliderAutoplay] = useState(true)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [audioDurationSeconds, setAudioDurationSeconds] = useState(0)
  const [language, setLanguage] = useState('es')
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(min-width: 1024px)').matches
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [streamStatus, setStreamStatus] = useState('idle')
  const [playerMode, setPlayerMode] = useState('live')
  const [currentTrack, setCurrentTrack] = useState('En vivo')
  const [currentShow, setCurrentShow] = useState('Tu Radio Latina')
  const [volume, setVolume] = useState(0.85)
  const [isMuted, setIsMuted] = useState(false)
  const [chatName, setChatName] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(getTodayScheduleDayId)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [uploadedEpisodeAudioByKey, setUploadedEpisodeAudioByKey] = useState({})
  const [activeEpisode, setActiveEpisode] = useState(null)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [adminUser, setAdminUser] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [episodePlaybackError, setEpisodePlaybackError] = useState('')
  const [episodeUploadSuccess, setEpisodeUploadSuccess] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [supabaseAdminUserId, setSupabaseAdminUserId] = useState(null)
  const [editableContent, setEditableContent] = useState(() => {
    if (typeof window === 'undefined') return {}

    try {
      const savedContent = window.localStorage.getItem(EDITABLE_CONTENT_STORAGE_KEY)
      return savedContent ? JSON.parse(savedContent) : {}
    } catch {
      return {}
    }
  })
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      name: 'Tu Radio Latina',
      text: '¡Bienvenidos al chat! Comparte desde dónde escuchas 🎶',
      time: '00:00',
    },
  ])

  const t = copy[language]
  const isDark = theme === 'dark'
  const { pathname } = useLocation()
  const currentView =
    pathname === '/programacion'
      ? 'programacion'
      : pathname === '/biblioteca'
        ? 'biblioteca'
        : pathname === '/locutores'
          ? 'locutores'
        : pathname === '/podcasts'
          ? 'podcasts'
          : pathname === '/contacto'
            ? 'contacto'
            : 'inicio'
  const showProgramacion = currentView === 'inicio' || currentView === 'programacion'
  const showBiblioteca = currentView === 'inicio' || currentView === 'biblioteca'
  const showLocutores = currentView === 'locutores'
  const showPodcasts = currentView === 'inicio' || currentView === 'podcasts'
  const showContacto = currentView === 'contacto'
  const currentTrackLabel = currentTrack || t.enVivo
  const currentShowLabel = currentShow || 'Tu Radio Latina'
  const isAdminMode = isAdminAuthenticated
  const getEditableValue = (key, fallback) => {
    const storedValue = editableContent[key]
    return typeof storedValue === 'string' && storedValue.length > 0 ? storedValue : fallback
  }

  const updateEditableValue = (key, value) => {
    const nextValue = typeof value === 'string' ? value.trim() : ''

    setEditableContent((prev) => {
      if (!nextValue) {
        const next = { ...prev }
        delete next[key]
        return next
      }

      return {
        ...prev,
        [key]: nextValue,
      }
    })
  }
  const weeklySchedule =
    language === 'es'
      ? [
          {
            id: 'monday',
            short: 'Lun',
            name: 'Lunes',
            programs: [
              {
                id: 1,
                time: '6:00 AM - 10:00 AM',
                title: 'Buenos días New York',
                description: 'Arranca la mañana con música latina, noticias y energía en cabina.',
              },
              {
                id: 2,
                time: '12:00 PM - 2:00 PM',
                title: 'La Pausa',
                description: 'Entrevistas cortas, actualidad y buena vibra en el mediodía.',
              },
              {
                id: 3,
                time: '7:00 PM - 9:00 PM',
                title: 'Cabina Central Latina',
                description: 'Reggaetón, pop latino y dedicatorias en vivo para cerrar el día.',
              },
              {
                id: 4,
                time: '11:00 PM - 12:00 AM',
                title: 'Noche Latina Express',
                description: 'Cierre con éxitos latinos para terminar el lunes en alto.',
              },
            ],
          },
          {
            id: 'tuesday',
            short: 'Mar',
            name: 'Martes',
            programs: [
              {
                id: 1,
                time: '6:00 AM - 10:00 AM',
                title: 'Mañana Latina',
                description: 'Noticias del barrio, tránsito y los clásicos latinos de siempre.',
              },
              {
                id: 2,
                time: '3:00 PM - 5:00 PM',
                title: 'Conexión Urbana',
                description: 'Estrenos urbanos y mensajes de la audiencia en tiempo real.',
              },
              {
                id: 3,
                time: '9:00 PM - 11:00 PM',
                title: 'Noche de Salsa',
                description: 'Salsa romántica, clásica y dura para bailar desde casa.',
              },
              {
                id: 4,
                time: '11:00 PM - 12:00 AM',
                title: 'Cierre Tropical',
                description: 'Bloque tropical para despedir el martes con ritmo.',
              },
            ],
          },
          {
            id: 'wednesday',
            short: 'Mié',
            name: 'Miércoles',
            programs: [
              {
                id: 1,
                time: '7:00 AM - 9:00 AM',
                title: 'Despierta con Ritmo',
                description: 'Música movida y energía para arrancar mitad de semana.',
              },
              {
                id: 2,
                time: '1:00 PM - 3:00 PM',
                title: 'La Pausa XL',
                description: 'Entrevistas y recomendaciones para la comunidad latina.',
              },
              {
                id: 3,
                time: '6:00 PM - 7:00 PM',
                title: 'El fútbol y algo más',
                description: 'Debate deportivo y análisis del fútbol con sabor latino.',
              },
              {
                id: 4,
                time: '9:00 PM - 10:00 PM',
                title: 'Mitad de Semana Mix',
                description: 'Selección de hits para recargar energías este miércoles.',
              },
            ],
          },
          {
            id: 'thursday',
            short: 'Jue',
            name: 'Jueves',
            programs: [
              {
                id: 1,
                time: '6:00 AM - 10:00 AM',
                title: 'Buenos días New York',
                description: 'Información local y éxitos para iniciar el jueves.',
              },
              {
                id: 2,
                time: '4:00 PM - 6:00 PM',
                title: 'Zona Mix',
                description: 'Mix en vivo con perreo, pop latino y bachata.',
              },
              {
                id: 3,
                time: '10:00 PM - 11:30 PM',
                title: 'After Latina',
                description: 'Set nocturno para cerrar el día con buen ritmo.',
              },
              {
                id: 4,
                time: '11:30 PM - 12:00 AM',
                title: 'Última Canción',
                description: 'Tramo final del jueves con clásicos latinos al cierre.',
              },
            ],
          },
          {
            id: 'friday',
            short: 'Vie',
            name: 'Viernes',
            programs: [
              {
                id: 1,
                time: '8:00 AM - 10:00 AM',
                title: 'Viernes Arriba',
                description: 'Música alegre y agenda de eventos para el fin de semana.',
              },
              {
                id: 2,
                time: '5:00 PM - 7:00 PM',
                title: 'Drive Time Latino',
                description: 'La mejor selección para el camino de regreso a casa.',
              },
              {
                id: 3,
                time: '9:00 PM - 12:00 AM',
                title: 'Friday Live Set',
                description: 'DJ invitado con mezcla en vivo y participación del chat.',
              },
              {
                id: 4,
                time: '12:00 AM - 1:00 AM',
                title: 'After Party Latino',
                description: 'Extensión nocturna para cerrar el viernes con energía.',
              },
            ],
          },
          {
            id: 'saturday',
            short: 'Sáb',
            name: 'Sábado',
            programs: [
              {
                id: 1,
                time: '10:00 AM - 12:00 PM',
                title: 'Sábado Familiar',
                description: 'Clásicos para compartir en casa con toda la familia.',
              },
              {
                id: 2,
                time: '2:00 PM - 4:00 PM',
                title: 'Top Latino Weekend',
                description: 'Conteo de los temas más escuchados de la semana.',
              },
              {
                id: 3,
                time: '8:00 PM - 11:00 PM',
                title: 'Noche de Fiesta',
                description: 'Reggaetón, salsa y merengue para encender el sábado.',
              },
              {
                id: 4,
                time: '11:00 PM - 12:00 AM',
                title: 'Sábado Late',
                description: 'Bloque de cierre con mezcla urbana para la noche.',
              },
            ],
          },
          {
            id: 'sunday',
            short: 'Dom',
            name: 'Domingo',
            programs: [
              {
                id: 1,
                time: '9:00 AM - 11:00 AM',
                title: 'Domingo Relax',
                description: 'Selección suave para comenzar el domingo con calma.',
              },
              {
                id: 2,
                time: '12:00 PM - 2:00 PM',
                title: 'Historias Latinas',
                description: 'Espacio de entrevistas e historias de nuestra comunidad.',
              },
              {
                id: 3,
                time: '7:00 PM - 9:00 PM',
                title: 'Resumen de la Semana',
                description: 'Lo mejor de la programación y los temas más sonados.',
              },
              {
                id: 4,
                time: '9:00 PM - 10:00 PM',
                title: 'Domingo de Recuerdos',
                description: 'Clásicos y dedicatorias para cerrar el domingo.',
              },
            ],
          },
        ]
      : [
          {
            id: 'monday',
            short: 'Mon',
            name: 'Monday',
            programs: [
              {
                id: 1,
                time: '6:00 AM - 10:00 AM',
                title: 'Good Morning New York',
                description: 'Start the day with latino music, local news and studio energy.',
              },
              {
                id: 2,
                time: '12:00 PM - 2:00 PM',
                title: 'The Pause',
                description: 'Midday block with interviews, updates and good vibes.',
              },
              {
                id: 3,
                time: '7:00 PM - 9:00 PM',
                title: 'Central Latino Studio',
                description: 'Live reggaeton, pop and shoutouts to close the day.',
              },
              {
                id: 4,
                time: '11:00 PM - 12:00 AM',
                title: 'Late Latino Express',
                description: 'Night wrap-up with latino hits to end Monday strong.',
              },
            ],
          },
          {
            id: 'tuesday',
            short: 'Tue',
            name: 'Tuesday',
            programs: [
              {
                id: 1,
                time: '6:00 AM - 10:00 AM',
                title: 'Latino Morning',
                description: 'Neighborhood news, traffic and timeless latino hits.',
              },
              {
                id: 2,
                time: '3:00 PM - 5:00 PM',
                title: 'Urban Connection',
                description: 'Fresh urban releases and audience shoutouts live.',
              },
              {
                id: 3,
                time: '9:00 PM - 11:00 PM',
                title: 'Salsa Night',
                description: 'Romantic and classic salsa to dance from home.',
              },
              {
                id: 4,
                time: '11:00 PM - 12:00 AM',
                title: 'Tropical Closeout',
                description: 'Tropical block to finish Tuesday with rhythm.',
              },
            ],
          },
          {
            id: 'wednesday',
            short: 'Wed',
            name: 'Wednesday',
            programs: [
              {
                id: 1,
                time: '7:00 AM - 9:00 AM',
                title: 'Wake Up with Rhythm',
                description: 'High-energy music to power through midweek.',
              },
              {
                id: 2,
                time: '1:00 PM - 3:00 PM',
                title: 'The Pause XL',
                description: 'Interviews and recommendations for the latino community.',
              },
              {
                id: 3,
                time: '6:00 PM - 7:00 PM',
                title: 'Football and More',
                description: 'Sports talk, football results and analysis with latino flavor.',
              },
              {
                id: 4,
                time: '9:00 PM - 10:00 PM',
                title: 'Midweek Mix',
                description: 'A hits selection to recharge your Wednesday night.',
              },
            ],
          },
          {
            id: 'thursday',
            short: 'Thu',
            name: 'Thursday',
            programs: [
              {
                id: 1,
                time: '6:00 AM - 10:00 AM',
                title: 'Good Morning New York',
                description: 'Local updates and top hits to start Thursday right.',
              },
              {
                id: 2,
                time: '4:00 PM - 6:00 PM',
                title: 'Mix Zone',
                description: 'Live mix session with reggaeton, pop and bachata.',
              },
              {
                id: 3,
                time: '10:00 PM - 11:30 PM',
                title: 'Latino After Hours',
                description: 'Late-night set to close the day with great vibes.',
              },
              {
                id: 4,
                time: '11:30 PM - 12:00 AM',
                title: 'Last Song',
                description: 'Final Thursday stretch with timeless latino songs.',
              },
            ],
          },
          {
            id: 'friday',
            short: 'Fri',
            name: 'Friday',
            programs: [
              {
                id: 1,
                time: '8:00 AM - 10:00 AM',
                title: 'Friday Boost',
                description: 'Upbeat tracks and events agenda for the weekend.',
              },
              {
                id: 2,
                time: '5:00 PM - 7:00 PM',
                title: 'Latino Drive Time',
                description: 'The best soundtrack for your ride back home.',
              },
              {
                id: 3,
                time: '9:00 PM - 12:00 AM',
                title: 'Friday Live Set',
                description: 'Guest DJ live mix with chat participation.',
              },
              {
                id: 4,
                time: '12:00 AM - 1:00 AM',
                title: 'After Party Latino',
                description: 'Late extension to close Friday with extra energy.',
              },
            ],
          },
          {
            id: 'saturday',
            short: 'Sat',
            name: 'Saturday',
            programs: [
              {
                id: 1,
                time: '10:00 AM - 12:00 PM',
                title: 'Family Saturday',
                description: 'Classics to enjoy at home with everyone.',
              },
              {
                id: 2,
                time: '2:00 PM - 4:00 PM',
                title: 'Weekend Latino Top',
                description: 'Countdown of the most played songs of the week.',
              },
              {
                id: 3,
                time: '8:00 PM - 11:00 PM',
                title: 'Party Night',
                description: 'Reggaeton, salsa and merengue to light up Saturday.',
              },
              {
                id: 4,
                time: '11:00 PM - 12:00 AM',
                title: 'Saturday Late',
                description: 'Closing urban mix to keep Saturday night alive.',
              },
            ],
          },
          {
            id: 'sunday',
            short: 'Sun',
            name: 'Sunday',
            programs: [
              {
                id: 1,
                time: '9:00 AM - 11:00 AM',
                title: 'Sunday Chill',
                description: 'Soft selection to start Sunday with calm energy.',
              },
              {
                id: 2,
                time: '12:00 PM - 2:00 PM',
                title: 'Latino Stories',
                description: 'Interview slot with stories from our community.',
              },
              {
                id: 3,
                time: '7:00 PM - 9:00 PM',
                title: 'Week Recap',
                description: 'Best moments and highlights from the week.',
              },
              {
                id: 4,
                time: '9:00 PM - 10:00 PM',
                title: 'Sunday Memories',
                description: 'Classics and shoutouts to close out Sunday.',
              },
            ],
          },
        ]
  const sliderShows = [
    {
      id: 1,
      title: 'Cabina Central Latina',
      schedule: 'Lunes a viernes · 7:00 PM - 9:00 PM',
      description: 'Reggaetón, pop latino y dedicatorias en tiempo real.',
      status: 'live',
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 2,
      title: 'Salsa & Bachata Nights',
      schedule: 'Hoy · 10:00 PM',
      description: 'Set en vivo con clásicos y nuevas mezclas.',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 3,
      title: 'Podcast Global Business',
      schedule: 'Episodio 254 · Disponible',
      description: 'Conversaciones sobre música, cultura y emprendimiento.',
      status: 'episode',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1400&q=80',
    },
  ]
  const currentSlide = sliderShows[activeSlide]
  const liveStatus =
    streamStatus === 'connecting'
      ? { label: t.statusConnecting, dotClass: 'bg-amber-400' }
      : streamStatus === 'live'
        ? playerMode === 'live'
          ? { label: t.statusLive, dotClass: 'bg-red-500' }
          : activeEpisode?.scope === 'library'
            ? { label: t.statusLibraryEpisode, dotClass: 'bg-emerald-400' }
            : { label: t.statusPodcast, dotClass: 'bg-emerald-400' }
        : streamStatus === 'error'
          ? { label: t.statusError, dotClass: 'bg-rose-500' }
          : null
  const activeScheduleDay = weeklySchedule.find((day) => day.id === selectedScheduleDay) || weeklySchedule[0]
  const homeSchedulePrograms = activeScheduleDay.programs.slice(0, 4)
  const getEpisodeAudioKey = (scope, itemId) => `${scope}-${itemId}-audio`

  useEffect(() => {
    if (!supabase) return

    let isCancelled = false

    const syncAdminSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const currentUser = sessionData.session?.user

      if (!currentUser) {
        if (isCancelled) return
        setSupabaseAdminUserId(null)
        setIsAdminAuthenticated(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (isCancelled) return

      const isAdminProfile = Boolean(profile?.is_admin)
      setSupabaseAdminUserId(currentUser.id)
      setIsAdminAuthenticated(isAdminProfile)
    }

    void syncAdminSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void syncAdminSession()
    })

    return () => {
      isCancelled = true
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    let isCancelled = false

    const loadEpisodeAudio = async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('scope,item_id,audio_url,audio_path')

      if (error || !data || isCancelled) return

      const nextAudioByKey = {}

      data.forEach((episode) => {
        const episodeKey = getEpisodeAudioKey(episode.scope, episode.item_id)

        if (episode.audio_url) {
          nextAudioByKey[episodeKey] = episode.audio_url
          return
        }

        if (!episode.audio_path) return

        const { data: publicUrlData } = supabase.storage.from(SUPABASE_EPISODES_BUCKET).getPublicUrl(episode.audio_path)
        if (publicUrlData?.publicUrl) {
          nextAudioByKey[episodeKey] = publicUrlData.publicUrl
        }
      })

      if (!isCancelled) {
        setUploadedEpisodeAudioByKey((prev) => ({
          ...nextAudioByKey,
          ...prev,
        }))
      }
    }

    void loadEpisodeAudio()

    return () => {
      isCancelled = true
    }
  }, [])

  // Centraliza cambios de estado en vivo del reproductor global.
  const updateLiveStatus = useCallback((nextStatus) => {
    setStreamStatus(nextStatus)
  }, [])

  const logStreamDebug = useCallback((...debugArgs) => {
    if (!IS_STREAM_DEBUG_ENABLED) return
    console.info('[TuRadioLatina][stream]', ...debugArgs)
  }, [])

  const setAudioStreamByIndex = useCallback((audio, nextIndex) => {
    const maxIndex = Math.max(STREAM_URLS.length - 1, 0)
    const safeIndex = Math.min(Math.max(nextIndex, 0), maxIndex)
    streamIndexRef.current = safeIndex
    const nextStreamUrl = STREAM_URLS[safeIndex] || STREAM_URL

    if (audio.src !== nextStreamUrl) {
      logStreamDebug('switch-source', { from: audio.src || null, to: nextStreamUrl, index: safeIndex })
      audio.src = nextStreamUrl
    }

    return nextStreamUrl
  }, [logStreamDebug])

  const recoverWithFallbackStream = useCallback(async (audio) => {
    if (isRecoveringStreamRef.current) return false

    const nextStreamIndex = streamIndexRef.current + 1
    if (nextStreamIndex >= STREAM_URLS.length) return false

    isRecoveringStreamRef.current = true
    logStreamDebug('trying-fallback', { nextStreamIndex, streamCount: STREAM_URLS.length })
    updateLiveStatus('connecting')
    setAudioStreamByIndex(audio, nextStreamIndex)

    try {
      await audio.play()
      setIsPlaying(true)
      updateLiveStatus('live')
      logStreamDebug('fallback-success', { activeSource: audio.currentSrc || audio.src })
      return true
    } catch {
      logStreamDebug('fallback-failed', {
        attemptedSource: audio.currentSrc || audio.src,
        errorCode: audio.error?.code,
        errorMessage: audio.error?.message,
      })
      return false
    } finally {
      isRecoveringStreamRef.current = false
    }
  }, [logStreamDebug, setAudioStreamByIndex, updateLiveStatus])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    setAudioStreamByIndex(audio, 0)

    const onPause = () => {
      if (isRecoveringStreamRef.current) return

      setIsPlaying(false)
      if (audio.error) {
        updateLiveStatus('error')
      } else {
        updateLiveStatus('idle')
      }
    }
    const onWaiting = () => {
      if (!audio.paused) {
        updateLiveStatus('connecting')
      }
    }
    const onPlaying = () => {
      setIsPlaying(true)
      updateLiveStatus('live')
    }
    const onTimeUpdate = () => {
      const nextTime = Number.isFinite(audio.currentTime) ? Math.floor(audio.currentTime) : 0
      setElapsedSeconds(nextTime)
    }
    const onDurationChange = () => {
      const nextDuration = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.floor(audio.duration) : 0
      setAudioDurationSeconds(nextDuration)
    }
    const onEmptied = () => {
      setElapsedSeconds(0)
      setAudioDurationSeconds(0)
    }
    const onError = () => {
      void (async () => {
        const recovered = await recoverWithFallbackStream(audio)
        if (recovered) return

        setIsPlaying(false)
        updateLiveStatus('error')
      })()
    }

    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('stalled', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('canplay', onPlaying)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onDurationChange)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('emptied', onEmptied)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('stalled', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('canplay', onPlaying)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onDurationChange)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('emptied', onEmptied)
      audio.removeEventListener('error', onError)
    }
  }, [recoverWithFallbackStream, setAudioStreamByIndex, updateLiveStatus])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
    audio.muted = isMuted
  }, [volume, isMuted])

  useEffect(() => {
    if (!isSliderAutoplay || sliderShows.length <= 1) return

    const intervalId = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderShows.length)
    }, 6000)

    return () => window.clearInterval(intervalId)
  }, [isSliderAutoplay, sliderShows.length])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(EDITABLE_CONTENT_STORAGE_KEY, JSON.stringify(editableContent))
  }, [editableContent])

  useEffect(() => {
    if (!isPlaying && playerMode === 'live') {
      setCurrentTrack(t.enVivo)
      setCurrentShow('Tu Radio Latina')
    }

    if (!isPlaying || playerMode !== 'live') return

    let isCancelled = false

    const fetchNowPlaying = async () => {
      try {
        const response = await fetch(STREAM_STATUS_URL, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('status_unavailable')
        }

        const data = await response.json()
        const sourcePayload = data?.icestats?.source
        const sources = Array.isArray(sourcePayload) ? sourcePayload : sourcePayload ? [sourcePayload] : []
        const selectedSource =
          sources.find((source) => typeof source?.listenurl === 'string' && source.listenurl.includes(STREAM_MOUNT_PATH)) ||
          sources[0]

        const trackName =
          selectedSource?.title ||
          selectedSource?.song ||
          selectedSource?.yp_currently_playing ||
          selectedSource?.server_description
        const stationName = selectedSource?.server_name && selectedSource.server_name !== 'no name' ? selectedSource.server_name : 'Tu Radio Latina'

        if (isCancelled) return

        setCurrentTrack(
          trackName && trackName !== 'Unspecified description' ? trackName : t.enVivo,
        )
        setCurrentShow(stationName)
        setPlayerMode('live')
      } catch {
        if (isCancelled) return
        setCurrentTrack(t.enVivo)
        setCurrentShow('Tu Radio Latina')
        setPlayerMode('live')
      }
    }

    fetchNowPlaying()
    const intervalId = window.setInterval(fetchNowPlaying, 15000)

    return () => {
      isCancelled = true
      window.clearInterval(intervalId)
    }
  }, [isPlaying, playerMode, t.enVivo])

  useEffect(() => {
    return () => {
      if (uploadSuccessTimeoutRef.current) {
        window.clearTimeout(uploadSuccessTimeoutRef.current)
      }
      uploadedEpisodeAudioUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  const getEpisodeAudioSource = (scope, itemId) => {
    const audioKey = getEpisodeAudioKey(scope, itemId)
    return uploadedEpisodeAudioByKey[audioKey] || getEditableValue(audioKey, '')
  }

  const registerEpisodeAudioInput = (inputKey, element) => {
    if (element) {
      episodeAudioInputRefs.current[inputKey] = element
      return
    }

    delete episodeAudioInputRefs.current[inputKey]
  }

  const openEpisodeAudioPicker = (scope, itemId) => {
    const inputKey = `${scope}-${itemId}`
    const input = episodeAudioInputRefs.current[inputKey]
    if (!input) return
    input.click()
  }

  const showEpisodeUploadSuccess = (message) => {
    if (uploadSuccessTimeoutRef.current) {
      window.clearTimeout(uploadSuccessTimeoutRef.current)
    }

    setEpisodeUploadSuccess(message)
    uploadSuccessTimeoutRef.current = window.setTimeout(() => {
      setEpisodeUploadSuccess('')
    }, 2600)
  }

  const handleEpisodeAudioUpload = async (scope, itemId, file) => {
    if (!file || !file.type.startsWith('audio/')) return

    const audioKey = getEpisodeAudioKey(scope, itemId)
    const previousObjectUrl = uploadedEpisodeAudioByKey[audioKey]


    if (!supabase) {
      setEpisodeUploadSuccess('')
      setAdminError('Configura Supabase en .env para subir MP3 de forma persistente.')
      return
    }

    if (!supabaseAdminUserId) {
      setEpisodeUploadSuccess('')
      setAdminError('Inicia sesión admin con tu email de Supabase para subir MP3.')
      return
    }

    const rawFileName = sanitizeStorageFileName(file.name) || `${scope}-${itemId}.mp3`
    const extension = rawFileName.includes('.') ? rawFileName.split('.').pop() : 'mp3'
    const storagePath = `${scope}/${itemId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_EPISODES_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type || 'audio/mpeg',
        upsert: false,
      })

    if (uploadError) {
      setEpisodeUploadSuccess('')
      setAdminError('No se pudo subir el MP3 a Supabase Storage.')
      return
    }

    const { data: publicUrlData } = supabase.storage.from(SUPABASE_EPISODES_BUCKET).getPublicUrl(storagePath)
    const publicAudioUrl = publicUrlData?.publicUrl

    const { error: upsertError } = await supabase.from('episodes').upsert(
      {
        scope,
        item_id: itemId,
        audio_path: storagePath,
        audio_url: publicAudioUrl || null,
        mime_type: file.type || 'audio/mpeg',
        file_size: file.size,
        created_by: supabaseAdminUserId,
      },
      {
        onConflict: 'scope,item_id',
      },
    )

    if (upsertError) {
      setEpisodeUploadSuccess('')
      setAdminError('El archivo subió, pero no se pudo guardar el episodio en la base de datos.')
      return
    }

    if (previousObjectUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previousObjectUrl)
      uploadedEpisodeAudioUrlsRef.current = uploadedEpisodeAudioUrlsRef.current.filter((url) => url !== previousObjectUrl)
    }

    setUploadedEpisodeAudioByKey((prev) => ({
      ...prev,
      [audioKey]: publicAudioUrl || prev[audioKey] || '',
    }))
    setEpisodePlaybackError('')
    setAdminError('')
    showEpisodeUploadSuccess('MP3 subido correctamente.')
  }

  const playEpisode = async ({ scope, itemId, title, host }) => {
    const audio = audioRef.current
    if (!audio) return

    const episodeAudioSource = getEpisodeAudioSource(scope, itemId)

    setCurrentTrack(title)
    setCurrentShow(host)
    setPlayerMode('podcast')

    if (!episodeAudioSource) {
      setEpisodePlaybackError('Este episodio aún no tiene MP3 cargado.')
      setIsPlaying(false)
      updateLiveStatus('idle')
      return
    }

    if (audio.src !== episodeAudioSource) {
      audio.src = episodeAudioSource
    }

    updateLiveStatus('connecting')

    try {
      await audio.play()
      setIsPlaying(true)
      setActiveEpisode({ scope, itemId })
      setEpisodePlaybackError('')
      updateLiveStatus('live')
      expandPlayer()
    } catch {
      setEpisodePlaybackError('No se pudo reproducir este MP3.')
      setIsPlaying(false)
      setActiveEpisode(null)
      updateLiveStatus('error')
    }
  }

  const handleEpisodePlayPointerDown = () => {
    hasFirstInteractionPlaybackRef.current = true
  }

  const startLivePlayback = useCallback(async () => {
    if (isStartingPlaybackRef.current) return

    const audio = audioRef.current
    if (!audio) return
    isStartingPlaybackRef.current = true

    updateLiveStatus('connecting')
    isRecoveringStreamRef.current = false
    setAudioStreamByIndex(audio, 0)
    logStreamDebug('play-request', { primarySource: STREAM_URLS[0] || STREAM_URL, candidates: STREAM_URLS })

    try {
      await audio.play()
      setIsPlaying(true)
      setActiveEpisode(null)
      updateLiveStatus('live')
      logStreamDebug('play-success', { activeSource: audio.currentSrc || audio.src })
    } catch {
      const recovered = await recoverWithFallbackStream(audio)
      if (recovered) return

      setIsPlaying(false)
      updateLiveStatus('error')
      logStreamDebug('play-failed', {
        activeSource: audio.currentSrc || audio.src,
        errorCode: audio.error?.code,
        errorMessage: audio.error?.message,
      })
    } finally {
      isStartingPlaybackRef.current = false
    }
  }, [logStreamDebug, recoverWithFallbackStream, setAudioStreamByIndex, updateLiveStatus])

  // Alterna reproducción del único audio global del sitio.
  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      updateLiveStatus('idle')
      return
    }

    if (playerMode === 'podcast' && audio.src) {
      updateLiveStatus('connecting')

      try {
        await audio.play()
        setIsPlaying(true)
        updateLiveStatus('live')
      } catch {
        setIsPlaying(false)
        updateLiveStatus('error')
      }
      return
    }

    await startLivePlayback()
  }

  // Expande el reproductor global del bloque derecho.
  const expandPlayer = () => {
    setIsPlayerExpanded(true)
  }

  // Colapsa el reproductor global para modo compacto/sticky.
  const collapsePlayer = () => {
    setIsPlayerExpanded(false)
  }

  // Fuerza reproducción desde cualquier CTA y abre el panel del reproductor.
  const handlePlayNow = async (mode = 'live') => {
    setPlayerMode(mode)
    if (!isPlaying) {
      await startLivePlayback()
    }
    expandPlayer()
  }

  useEffect(() => {
    const handleFirstPointerDown = (event) => {
      if (hasFirstInteractionPlaybackRef.current) return

      const targetElement = event.target
      if (targetElement instanceof Element && targetElement.closest('[data-audio-trigger="episode"]')) {
        hasFirstInteractionPlaybackRef.current = true
        return
      }

      hasFirstInteractionPlaybackRef.current = true

      const audio = audioRef.current
      if (audio && !audio.paused) return

      void startLivePlayback()
    }

    window.addEventListener('pointerdown', handleFirstPointerDown, { once: true, passive: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstPointerDown)
    }
  }, [startLivePlayback])

  useEffect(() => {
    if (isDesktopViewport || typeof window === 'undefined') return undefined

    const sectionElementByView = {
      inicio: mobileInicioSectionRef.current || mobileProgramacionSectionRef.current,
      programacion: mobileProgramacionSectionRef.current,
      biblioteca: mobileBibliotecaSectionRef.current,
      locutores: mobileLocutoresSectionRef.current,
      podcasts: mobilePodcastsSectionRef.current,
      contacto: mobileContactoSectionRef.current,
    }

    const targetSection = sectionElementByView[currentView]
    if (!targetSection) return undefined

    const timeoutId = window.setTimeout(() => {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 90)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [currentView, isDesktopViewport])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const handleViewportChange = (event) => {
      setIsDesktopViewport(event.matches)
    }

    setIsDesktopViewport(desktopQuery.matches)
    desktopQuery.addEventListener('change', handleViewportChange)

    return () => {
      desktopQuery.removeEventListener('change', handleViewportChange)
    }
  }, [])

  const goToPrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? sliderShows.length - 1 : prev - 1))
  }

  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % sliderShows.length)
  }

  const getSlideBadge = (status) => {
    if (status === 'live') return { label: t.enVivoBadge, className: 'bg-red-500 text-white' }
    if (status === 'upcoming') return { label: t.proximoBadge, className: 'bg-amber-400 text-slate-900' }
    return { label: t.episodioBadge, className: 'bg-emerald-400 text-slate-900' }
  }

  const getSlideActionLabel = (status) => {
    if (status === 'live') return t.escucharAhora
    if (status === 'upcoming') return t.verProgramacion
    return t.escucharEpisodio
  }

  const getMostRecentPodcastItem = async () => {
    if (!recommended.length) return null
    if (!supabase) return recommended[0]

    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('item_id')
        .eq('scope', 'podcast')
        .or('audio_path.not.is.null,audio_url.not.is.null')
        .order('updated_at', { ascending: false })
        .limit(1)

      if (!error && data?.length) {
        const recentPodcast = recommended.find((item) => String(item.id) === String(data[0].item_id))
        if (recentPodcast) return recentPodcast
      }
    } catch {
      return recommended[0]
    }

    return recommended[0]
  }

  const handleSlideAction = async (show) => {
    if (show.status === 'episode') {
      const recentPodcast = await getMostRecentPodcastItem()
      if (!recentPodcast) return

      const title = getEditableValue(`podcast-${recentPodcast.id}-title`, recentPodcast.title)
      const host = getEditableValue(`podcast-${recentPodcast.id}-host`, recentPodcast.host)

      if (currentView !== 'podcasts') {
        navigate('/podcasts')
      }

      await playEpisode({
        scope: 'podcast',
        itemId: recentPodcast.id,
        title,
        host,
      })
      return
    }

    setCurrentTrack(show.title)
    setCurrentShow(show.schedule)
    setPlayerMode('live')

    if (show.status === 'upcoming') {
      navigate('/programacion')
      return
    }

    await handlePlayNow('live')
  }

  const handleScheduleSeeAll = () => {
    if (currentView !== 'programacion') {
      navigate('/programacion')
    }
  }

  const handleLibrarySeeAll = () => {
    if (currentView !== 'biblioteca') {
      navigate('/biblioteca')
    }
  }

  const handleToggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    const nextMuted = !audio.muted
    audio.muted = nextMuted
    setIsMuted(nextMuted)
  }

  const handleVolumeChange = (event) => {
    const audio = audioRef.current
    if (!audio) return

    const nextVolume = Number(event.target.value)
    audio.volume = nextVolume
    audio.muted = nextVolume === 0
    setVolume(nextVolume)
    setIsMuted(nextVolume === 0)
  }

  const handleSeekBySeconds = (offsetSeconds) => {
    const audio = audioRef.current
    if (!audio) return
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return

    const nextTime = Math.min(Math.max(audio.currentTime + offsetSeconds, 0), audio.duration)
    audio.currentTime = nextTime
    setElapsedSeconds(Math.floor(nextTime))
  }

  const handleSeekToPercent = (nextPercent) => {
    const audio = audioRef.current
    if (!audio) return
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return

    const safePercent = Math.min(Math.max(Number(nextPercent) || 0, 0), 100)
    const nextTime = (safePercent / 100) * audio.duration
    audio.currentTime = nextTime
    setElapsedSeconds(Math.floor(nextTime))
  }

  const isEpisodeCurrentlyPlaying = (scope, itemId) => {
    if (!activeEpisode) return false
    return playerMode === 'podcast' && isPlaying && activeEpisode.scope === scope && activeEpisode.itemId === itemId
  }

  const handleEpisodeToggleFromList = async ({ scope, itemId, title, host }) => {
    const audio = audioRef.current
    if (!audio) return

    if (isEpisodeCurrentlyPlaying(scope, itemId)) {
      audio.pause()
      setIsPlaying(false)
      updateLiveStatus('idle')
      return
    }

    await playEpisode({ scope, itemId, title, host })
  }

  const handleSendChatMessage = (event) => {
    event.preventDefault()

    const content = chatMessage.trim()
    if (!content) return

    const author = chatName.trim() || t.usuarioAnonimo
    const timeLabel = new Date().toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: author,
        text: content,
        time: timeLabel,
      },
    ])

    setChatMessage('')
  }

  const handleContactSubmit = (event) => {
    event.preventDefault()

    const senderName = contactName.trim()
    const senderEmail = contactEmail.trim()
    const subject = contactSubject.trim() || 'Contacto desde Tu Radio Latina'
    const message = contactMessage.trim()

    if (!senderName || !senderEmail || !message) return

    const body = `Nombre: ${senderName}\nEmail: ${senderEmail}\n\nMensaje:\n${message}`
    const mailtoUrl = `mailto:ederarmo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    window.location.href = mailtoUrl
  }

  const handleAdminLogin = async (event) => {
    event.preventDefault()

    const normalizedUser = adminUser.trim()

    if (!supabase) {
      setAdminError('Configura Supabase en .env para habilitar acceso admin.')
      return
    }

    if (!normalizedUser.includes('@')) {
      setAdminError('Ingresa tu email de Supabase para iniciar sesión admin.')
      return
    }

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: normalizedUser,
      password: adminPassword,
    })

    if (loginError || !loginData.user) {
      setAdminError('No se pudo iniciar sesión en Supabase.')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', loginData.user.id)
      .maybeSingle()

    if (profileError || !profile?.is_admin) {
      await supabase.auth.signOut()
      setAdminError('Tu usuario existe, pero no tiene permisos de administrador.')
      return
    }

    setSupabaseAdminUserId(loginData.user.id)
    setIsAdminAuthenticated(true)
    setAdminError('')
    setIsAdminModalOpen(false)
    setAdminPassword('')
  }

  const handleAdminLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }

    setIsAdminAuthenticated(false)
    setSupabaseAdminUserId(null)
    setAdminUser('')
    setAdminPassword('')
    setAdminError('')
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Tu Radio Latina',
      text: `${currentTrackLabel} · ${currentShowLabel}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }

      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Silencioso para no romper flujo del reproductor.
    }
  }

  const formatElapsed = (seconds) => {
    const total = Number.isFinite(seconds) ? Math.max(seconds, 0) : 0
    const mins = Math.floor(total / 60)
    const secs = total % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  const liveProgress = Math.min(((elapsedSeconds % 1800) / 1800) * 100, 100)
  const canSeekInPlayer = playerMode === 'podcast' && audioDurationSeconds > 0
  const playerProgress = canSeekInPlayer ? Math.min((elapsedSeconds / audioDurationSeconds) * 100, 100) : liveProgress
  const playerElapsedLabel = formatElapsed(elapsedSeconds)
  const playerDurationLabel = canSeekInPlayer ? formatElapsed(audioDurationSeconds) : null
  const playerBadge =
    playerMode === 'live'
      ? { label: t.enVivoBadge, className: 'bg-red-500 text-white' }
      : activeEpisode?.scope === 'library'
        ? { label: t.libraryEpisodeBadge, className: 'bg-emerald-400 text-slate-900' }
        : { label: t.podcastBadge, className: 'bg-emerald-400 text-slate-900' }
  const playerToggleActionLabel =
    playerMode === 'live'
      ? isPlaying
        ? t.pauseLive
        : t.playLive
      : activeEpisode?.scope === 'library'
        ? isPlaying
          ? t.pauseEpisode
          : t.playEpisode
        : isPlaying
          ? t.pausePodcast
          : t.playPodcast
  const playerWaveformKey = playerMode === 'podcast' && activeEpisode ? `${activeEpisode.scope}-${activeEpisode.itemId}` : playerMode
  const resolveActiveEpisodeCover = () => {
    if (playerMode !== 'podcast' || !activeEpisode) return ''

    const sourceList = activeEpisode.scope === 'library' ? continueListening : recommended
    const activeItem = sourceList.find((item) => String(item.id) === String(activeEpisode.itemId))
    if (!activeItem) return ''

    return getEditableValue(`${activeEpisode.scope}-${activeItem.id}-cover`, activeItem.cover)
  }
  const livePlayerCoverImage = getEditableValue('player-cover-image', DEFAULT_PLAYER_COVER_IMAGE)
  const playerCoverImage = resolveActiveEpisodeCover() || livePlayerCoverImage
  const hostsInfo = hostsContent[language]

  const mainMenuLinks = [
    { icon: Radio, label: getEditableValue('menu-inicio', t.inicio), to: '/', active: pathname === '/' },
    { icon: CalendarDays, label: getEditableValue('menu-programacion', t.programacion), to: '/programacion', active: pathname === '/programacion' },
    { icon: Library, label: getEditableValue('menu-biblioteca', t.biblioteca), to: '/biblioteca', active: pathname === '/biblioteca' },
    { icon: UserRound, label: getEditableValue('menu-locutores', t.locutores), to: '/locutores', active: pathname === '/locutores' },
    { icon: Mic2, label: getEditableValue('menu-podcasts', t.podcasts), to: '/podcasts', active: pathname === '/podcasts' },
    { icon: MessageCircle, label: getEditableValue('menu-contacto', t.contacto), to: '/contacto', active: pathname === '/contacto' },
  ]

  return (
    <div className={`min-h-screen px-4 pt-6 pb-24 lg:px-8 lg:py-10 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <audio id="radioPlayer" ref={audioRef} preload="none" playsInline />

      <main
        className={`relative mx-auto w-full max-w-[390px] rounded-[34px] p-4 pb-24 lg:max-w-6xl lg:rounded-3xl lg:p-8 lg:pb-8 ${
          isDark
            ? 'border border-slate-800 bg-slate-900 shadow-[0_20px_50px_rgba(2,6,23,0.55)]'
            : 'border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]'
        }`}
      >
        <header className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={logoRadio} alt="Tu Radio Latina" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-600'}`}
            aria-label={t.menu}
            title={t.menu}
          >
            <Menu size={16} />
          </button>
        </header>

        {isAdminModalOpen && (
          <div className="mb-4 rounded-2xl border border-[#635BFF]/40 bg-slate-900/95 p-4">
            <h3 className="text-sm font-semibold text-slate-100">Acceso administrador</h3>
            <p className="mt-1 text-xs text-slate-400">
              Inicia sesión con tu email y contraseña de Supabase para editar y subir audios.
            </p>

            <form onSubmit={handleAdminLogin} className="mt-3 space-y-2">
              <input
                type="email"
                value={adminUser}
                onChange={(event) => setAdminUser(event.target.value)}
                placeholder="Email admin (Supabase)"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-[#635BFF]/30"
              />
              <input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder="Contraseña"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-[#635BFF]/30"
              />
              {adminError && <p className="text-xs font-medium text-rose-300">{adminError}</p>}
              <div className="flex items-center gap-2">
                <button type="submit" className="rounded-lg bg-[#635BFF] px-3 py-1.5 text-xs font-semibold text-white">
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false)
                    setAdminError('')
                  }}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {isMobileMenuOpen && (
          <section
            className={`mb-4 rounded-2xl border p-3 lg:hidden ${
              isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              {mainMenuLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={`mobile-menu-${link.to}`}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                      link.active
                        ? 'bg-[#635BFF] text-white'
                        : isDark
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className={`mt-3 border-t pt-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="mb-3">
                {isAdminAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
                      isDark
                        ? 'border-emerald-300 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                        : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    Admin activo · Cerrar sesión
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsAdminModalOpen(true)
                    }}
                    className="w-full rounded-xl border border-[#635BFF]/60 bg-[#635BFF]/20 px-3 py-2 text-xs font-semibold text-[#c8c5ff]"
                  >
                    Ingresar admin (Supabase)
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div
                  className={`flex items-center rounded-full border p-1 text-xs font-semibold ${
                    isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <button
                    onClick={() => {
                      setLanguage('es')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`rounded-full px-3 py-1 ${language === 'es' ? 'bg-yellow-400 text-slate-900' : ''}`}
                  >
                    ES
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`rounded-full px-3 py-1 ${language === 'en' ? 'bg-yellow-400 text-slate-900' : ''}`}
                  >
                    EN
                  </button>
                </div>

                <button
                  onClick={() => {
                    setTheme(isDark ? 'light' : 'dark')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex h-8 w-14 items-center rounded-full border p-1 ${isDark ? 'justify-start border-slate-700 bg-slate-800' : 'justify-end border-slate-200 bg-white'}`}
                  aria-label="Cambiar tema"
                  title="Cambiar tema"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-slate-900">
                    {isDark ? <Moon size={13} /> : <Sun size={13} />}
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        <>
          <div className="lg:hidden">
            <NowOnAirSlider
              title={t.ahoraCabina}
              slide={currentSlide}
              slideKeyPrefix={`slide-${currentSlide.id}`}
              activeSlide={activeSlide}
              totalSlides={sliderShows.length}
              autoplayLabel={isSliderAutoplay ? t.autoplayOn : t.autoplayOff}
              badge={getSlideBadge(currentSlide.status)}
              actionLabel={getSlideActionLabel(currentSlide.status)}
              onAction={() => handleSlideAction(currentSlide)}
              onPrev={goToPrevSlide}
              onNext={goToNextSlide}
              onToggleAutoplay={() => setIsSliderAutoplay((prev) => !prev)}
              isAdminMode={isAdminMode}
              getEditableValue={getEditableValue}
              onEditableChange={updateEditableValue}
            />

            <GlobalPlayerCard
              isPlaying={isPlaying}
              isExpanded={isPlayerExpanded}
              isSticky={isPlayerSticky}
              canSeek={canSeekInPlayer}
              enableWaveform={!isDesktopViewport}
              mediaElementRef={audioRef}
              waveformKey={playerWaveformKey}
              track={currentTrackLabel}
              show={currentShowLabel}
              cover={playerCoverImage || DEFAULT_PLAYER_COVER_IMAGE}
              badge={playerBadge}
              badgeClassName={playerBadge.className}
              volume={volume}
              isMuted={isMuted}
              elapsed={playerElapsedLabel}
              duration={playerDurationLabel}
              progress={playerProgress}
              playToggleLabel={playerToggleActionLabel}
              t={t}
              onPlayToggle={togglePlay}
              onSkipBackward={() => handleSeekBySeconds(-15)}
              onSkipForward={() => handleSeekBySeconds(15)}
              onSeekChange={handleSeekToPercent}
              onExpand={expandPlayer}
              onCollapse={collapsePlayer}
              onMuteToggle={handleToggleMute}
              onVolumeChange={handleVolumeChange}
              onShare={handleShare}
              editableCover={isAdminMode}
              onCoverSave={(value) => updateEditableValue('player-cover-image', value)}
              mobile
            />

            {isPlayerSticky && isPlaying && <div className="h-24" />}

            {currentView === 'inicio' && (
              <section
                ref={mobileInicioSectionRef}
                className={`mb-5 rounded-2xl border p-3 ${
                  isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="mb-2">
                  <EditableText
                    as="h2"
                    value={getEditableValue('chat-title-mobile', t.liveChat)}
                    editable={isAdminMode}
                    onSave={(value) => updateEditableValue('chat-title-mobile', value)}
                    className="text-sm font-semibold"
                  />
                  <EditableText
                    as="p"
                    value={getEditableValue('chat-subtitle-mobile', t.joinChat)}
                    editable={isAdminMode}
                    onSave={(value) => updateEditableValue('chat-subtitle-mobile', value)}
                    className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                  />
                </div>

                <input
                  type="text"
                  value={chatName}
                  onChange={(event) => setChatName(event.target.value)}
                  placeholder={t.tuNombre}
                  className={`mb-2 w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                />

                <div
                  className={`mb-2 h-32 overflow-y-auto rounded-lg border p-2 ${
                    isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="space-y-2">
                    {chatMessages.map((message) => (
                      <article key={message.id} className={`rounded-md p-2 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{message.name}</p>
                          <span className="text-[10px] text-slate-400">{message.time}</span>
                        </div>
                        <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{message.text}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(event) => setChatMessage(event.target.value)}
                    placeholder={t.escribeMensaje}
                    className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                        : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#635BFF] px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Send size={13} />
                    {t.enviar}
                  </button>
                </form>
              </section>
            )}

              {showProgramacion && (
                <section ref={mobileProgramacionSectionRef} className="mb-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{t.programacion}</h2>
                    {currentView !== 'programacion' && (
                      <button
                        type="button"
                        onClick={handleScheduleSeeAll}
                        className="border-b-2 border-transparent pb-0.5 text-xs font-semibold text-[#635BFF] transition-colors hover:border-yellow-400"
                      >
                        {t.seeAll}
                      </button>
                    )}
                  </div>

                  {currentView === 'programacion' ? (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{t.chooseDay}</p>
                      <div className="mt-2 flex items-center justify-between gap-1.5 overflow-x-auto pb-1">
                        {weeklySchedule.map((day) => {
                          const isActiveDay = activeScheduleDay?.id === day.id

                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => setSelectedScheduleDay(day.id)}
                              className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-semibold transition ${
                                isActiveDay
                                  ? 'bg-[#635BFF] text-white shadow-[0_10px_18px_rgba(99,91,255,0.35)]'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {day.short}
                            </button>
                          )
                        })}
                      </div>

                      <div className="mt-4">
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{activeScheduleDay.name}</p>
                        <div className="mt-2.5 space-y-2.5">
                          {activeScheduleDay.programs.map((program) => (
                            <article key={`${activeScheduleDay.id}-${program.id}`} className={`rounded-xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                              <EditableText
                                as="p"
                                value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-time`, program.time)}
                                editable={isAdminMode}
                                onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-time`, value)}
                                className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400"
                              />
                              <EditableText
                                as="p"
                                value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-title`, program.title)}
                                editable={isAdminMode}
                                onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-title`, value)}
                                className={`mt-1 text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}
                              />
                              <EditableText
                                as="p"
                                value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-description`, program.description)}
                                editable={isAdminMode}
                                onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-description`, value)}
                                className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                              />
                            </article>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{t.chooseDay}</p>
                      <div className="mt-2 grid grid-cols-7 gap-2">
                        {weeklySchedule.map((day) => {
                          const isActiveDay = activeScheduleDay?.id === day.id

                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => setSelectedScheduleDay(day.id)}
                              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                                isActiveDay
                                  ? 'bg-[#635BFF] text-white shadow-[0_10px_18px_rgba(99,91,255,0.35)]'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {day.short}
                            </button>
                          )
                        })}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        {homeSchedulePrograms.map((program) => (
                          <article key={`${activeScheduleDay.id}-${program.id}`} className={`rounded-xl p-2.5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <EditableText
                              as="p"
                              value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-time`, program.time)}
                              editable={isAdminMode}
                              onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-time`, value)}
                              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400"
                            />
                            <EditableText
                              as="p"
                              value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-title`, program.title)}
                              editable={isAdminMode}
                              onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-title`, value)}
                              className={`mt-1 text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}
                            />
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}

              {showBiblioteca && (
                <section ref={mobileBibliotecaSectionRef} className="mb-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{t.biblioteca}</h2>
                    <button
                      type="button"
                      onClick={handleLibrarySeeAll}
                      className="border-b-2 border-transparent pb-0.5 text-xs font-semibold text-[#635BFF] transition-colors hover:border-yellow-400"
                    >
                      {t.seeAll}
                    </button>
                  </div>

                  {episodeUploadSuccess && (
                    <p className="mb-2 rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
                      {episodeUploadSuccess}
                    </p>
                  )}

                  {episodePlaybackError && (
                    <p className="mb-2 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200">
                      {episodePlaybackError}
                    </p>
                  )}

                  <div className="space-y-2.5">
                    {continueListening.map((item) => (
                      <article key={item.id} className={`rounded-2xl p-2.5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        {(() => {
                          const episode = getEditableValue(`library-${item.id}-episode`, item.episode)
                          const title = getEditableValue(`library-${item.id}-title`, item.title)
                          const host = getEditableValue(`library-${item.id}-host`, item.host)
                          const cover = getEditableValue(`library-${item.id}-cover`, item.cover)
                          const isCurrentEpisodePlaying = isEpisodeCurrentlyPlaying('library', item.id)

                          return (
                            <div className="flex items-center gap-2.5">
                              <EditableImage
                                src={cover}
                                alt={title}
                                editable={isAdminMode}
                                onSave={(value) => updateEditableValue(`library-${item.id}-cover`, value)}
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <EditableText
                                  as="p"
                                  value={episode}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`library-${item.id}-episode`, value)}
                                  className="text-[10px] font-semibold text-slate-400"
                                />
                                <EditableText
                                  as="p"
                                  value={title}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`library-${item.id}-title`, value)}
                                  className="truncate text-xs font-semibold"
                                />
                                <EditableText
                                  as="p"
                                  value={host}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`library-${item.id}-host`, value)}
                                  className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                                />
                              </div>
                              {isAdminMode && (
                                <>
                                  <input
                                    ref={(element) => registerEpisodeAudioInput(`library-${item.id}`, element)}
                                    type="file"
                                    accept="audio/*,.mp3"
                                    className="hidden"
                                    onChange={(event) => {
                                      const nextFile = event.target.files?.[0]
                                      if (nextFile) {
                                        void handleEpisodeAudioUpload('library', item.id, nextFile)
                                      }
                                      event.target.value = ''
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => openEpisodeAudioPicker('library', item.id)}
                                    className="rounded-full bg-[#FF9F3F] p-2 text-white"
                                    aria-label="Subir audio MP3"
                                    title="Subir audio MP3"
                                  >
                                    <Upload size={12} />
                                  </button>
                                </>
                              )}
                              <button
                                onPointerDown={handleEpisodePlayPointerDown}
                                onClick={() => {
                                  void handleEpisodeToggleFromList({ scope: 'library', itemId: item.id, title, host })
                                }}
                                className="rounded-full bg-[#635BFF] p-2 text-white"
                                aria-label={isCurrentEpisodePlaying ? 'Pausar episodio' : 'Reproducir episodio'}
                                title={isCurrentEpisodePlaying ? 'Pausar episodio' : 'Reproducir episodio'}
                              >
                                {isCurrentEpisodePlaying ? <Pause size={12} /> : <Play size={12} className="translate-x-0.5" />}
                              </button>
                            </div>
                          )
                        })()}
                        <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <span className="block h-full rounded-full bg-[#20B6FF]" style={{ width: `${item.progress}%` }} />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {showLocutores && (
                <div ref={mobileLocutoresSectionRef}>
                  <HostsSection
                    title={hostsInfo.title}
                    featured={hostsInfo.featured}
                    featuredBadge={hostsInfo.featuredBadge}
                    featuredBadges={hostsInfo.featuredBadges}
                    secondary={hostsInfo.secondary}
                    isDark={isDark}
                    isAdminMode={isAdminMode}
                    getEditableValue={getEditableValue}
                    onEditableChange={updateEditableValue}
                  />
                </div>
              )}

              {showPodcasts && (
                <section ref={mobilePodcastsSectionRef}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{t.podcasts}</h2>
                    <button
                      type="button"
                      className="border-b-2 border-transparent pb-0.5 text-xs font-semibold text-[#635BFF] transition-colors hover:border-yellow-400"
                    >
                      {t.seeAll}
                    </button>
                  </div>

                  {episodeUploadSuccess && (
                    <p className="mb-2 rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
                      {episodeUploadSuccess}
                    </p>
                  )}

                  {episodePlaybackError && (
                    <p className="mb-2 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200">
                      {episodePlaybackError}
                    </p>
                  )}

                  <div className="space-y-2.5">
                    {recommended.map((item) => (
                      <article key={item.id} className={`flex items-center gap-2.5 rounded-2xl p-2.5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        {(() => {
                          const episode = getEditableValue(`podcast-${item.id}-episode`, item.episode)
                          const title = getEditableValue(`podcast-${item.id}-title`, item.title)
                          const host = getEditableValue(`podcast-${item.id}-host`, item.host)
                          const cover = getEditableValue(`podcast-${item.id}-cover`, item.cover)
                          const isCurrentEpisodePlaying = isEpisodeCurrentlyPlaying('podcast', item.id)

                          return (
                            <>
                              <EditableImage
                                src={cover}
                                alt={title}
                                editable={isAdminMode}
                                onSave={(value) => updateEditableValue(`podcast-${item.id}-cover`, value)}
                                className="h-12 w-12 rounded-xl object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <EditableText
                                  as="p"
                                  value={episode}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`podcast-${item.id}-episode`, value)}
                                  className="text-[10px] font-semibold text-slate-400"
                                />
                                <EditableText
                                  as="p"
                                  value={title}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`podcast-${item.id}-title`, value)}
                                  className="truncate text-xs font-semibold"
                                />
                                <EditableText
                                  as="p"
                                  value={host}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`podcast-${item.id}-host`, value)}
                                  className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                                />
                              </div>
                              {isAdminMode && (
                                <>
                                  <input
                                    ref={(element) => registerEpisodeAudioInput(`podcast-${item.id}`, element)}
                                    type="file"
                                    accept="audio/*,.mp3"
                                    className="hidden"
                                    onChange={(event) => {
                                      const nextFile = event.target.files?.[0]
                                      if (nextFile) {
                                        void handleEpisodeAudioUpload('podcast', item.id, nextFile)
                                      }
                                      event.target.value = ''
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => openEpisodeAudioPicker('podcast', item.id)}
                                    className="rounded-full bg-[#FF9F3F] p-2 text-white"
                                    aria-label="Subir audio MP3"
                                    title="Subir audio MP3"
                                  >
                                    <Upload size={12} />
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onPointerDown={handleEpisodePlayPointerDown}
                                onClick={() => {
                                  void handleEpisodeToggleFromList({ scope: 'podcast', itemId: item.id, title, host })
                                }}
                                className="rounded-full bg-[#635BFF] p-2 text-white"
                                aria-label={isCurrentEpisodePlaying ? 'Pausar episodio' : 'Reproducir episodio'}
                                title={isCurrentEpisodePlaying ? 'Pausar episodio' : 'Reproducir episodio'}
                              >
                                {isCurrentEpisodePlaying ? <Pause size={12} /> : <Play size={12} className="translate-x-0.5" />}
                              </button>
                            </>
                          )
                        })()}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {showContacto && (
                <section ref={mobileContactoSectionRef}>
                  <div className="mb-3 flex items-center justify-between">
                      <EditableText
                        as="h2"
                        value={getEditableValue('contact-title-mobile', t.contacto)}
                        editable={isAdminMode}
                        onSave={(value) => updateEditableValue('contact-title-mobile', value)}
                        className="text-sm font-semibold"
                      />
                  </div>

                  <div className={`mb-3 rounded-2xl border p-3 text-left ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                    <EditableText
                      as="p"
                      value={getEditableValue('contact-whatsapp-label-mobile', 'WhatsApp')}
                      editable={isAdminMode}
                      onSave={(value) => updateEditableValue('contact-whatsapp-label-mobile', value)}
                      className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}
                    />
                    <a href="https://wa.me/13475935721" target="_blank" rel="noreferrer" className="mt-1 block text-xs font-medium text-[#635BFF]">
                      +1 (347) 593-5721
                    </a>
                    <EditableText
                      as="p"
                      value={getEditableValue('contact-location-mobile', 'New York City: Bronx, Manhattan, Queens, Brooklyn y Staten Island.')}
                      editable={isAdminMode}
                      onSave={(value) => updateEditableValue('contact-location-mobile', value)}
                      className={`mt-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                    />
                  </div>

                  <section
                    className={`rounded-2xl border p-3 ${
                      isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <EditableText
                      as="p"
                      value={getEditableValue('chat-subtitle-contact-mobile', t.joinChat)}
                      editable={isAdminMode}
                      onSave={(value) => updateEditableValue('chat-subtitle-contact-mobile', value)}
                      className={`mb-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                    />

                    <input
                      type="text"
                      value={chatName}
                      onChange={(event) => setChatName(event.target.value)}
                      placeholder={t.tuNombre}
                      className={`mb-2 w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                          : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                      }`}
                    />

                    <div
                      className={`mb-2 h-32 overflow-y-auto rounded-lg border p-2 ${
                        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="space-y-2">
                        {chatMessages.map((message) => (
                          <article key={message.id} className={`rounded-md p-2 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                            <div className="flex items-center justify-between gap-2">
                              <p className={`truncate text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{message.name}</p>
                              <span className="text-[10px] text-slate-400">{message.time}</span>
                            </div>
                            <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{message.text}</p>
                          </article>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(event) => setChatMessage(event.target.value)}
                        placeholder={t.escribeMensaje}
                        className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                          isDark
                            ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                            : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                        }`}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#635BFF] px-3 py-2 text-xs font-semibold text-white"
                      >
                        <Send size={13} />
                        {t.enviar}
                      </button>
                    </form>
                  </section>
                </section>
              )}

              <nav className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[430px] items-center justify-around border-t px-2 py-2 backdrop-blur-sm ${
                isDark ? 'border-slate-700 bg-slate-900/95 text-slate-300' : 'border-slate-200 bg-white/95 text-slate-400'
              }`}>
                {mainMenuLinks.slice(1, 3).map((link) => (
                  <NavItem
                    key={link.to}
                    icon={link.icon}
                    label={link.label}
                    to={link.to}
                    active={link.active}
                    isDark={isDark}
                    onClick={link.onClick}
                  />
                ))}
                <PlayerNavItem
                  isPlaying={isPlaying}
                  onToggle={async () => {
                    if (isPlaying) {
                      await togglePlay()
                      return
                    }

                    await handlePlayNow('live')
                  }}
                />
                {mainMenuLinks.slice(3).map((link) => (
                  <NavItem
                    key={link.to}
                    icon={link.icon}
                    label={link.label}
                    to={link.to}
                    active={link.active}
                    isDark={isDark}
                    onClick={link.onClick}
                  />
                ))}
              </nav>
            </div>

            <div
              className="hidden lg:grid lg:gap-6"
              style={{
                gridTemplateColumns: `${isSidebarCollapsed ? '88px' : '220px'} minmax(0,${isPlayerExpanded ? '1.85fr' : '2.33fr'}) minmax(280px,${isPlayerExpanded ? '1fr' : '0.95fr'})`,
              }}
            >
              <aside
                className={`flex h-full flex-col rounded-2xl border ${
                  isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'
                } ${isSidebarCollapsed ? 'p-3' : 'p-4'}`}
              >
                <div className={`mb-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                  {!isSidebarCollapsed && <img src={logoRadio} alt="Tu Radio Latina" className="h-12 w-auto object-contain" />}
                  <button
                    onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    aria-label={isSidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
                    title={isSidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
                  >
                    <Menu size={16} />
                  </button>
                </div>
                {!isSidebarCollapsed && liveStatus && (
                  <p className={`-mt-2 mb-3 flex items-center gap-1.5 px-1 text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                    <span className={`h-2 w-2 rounded-full ${liveStatus.dotClass}`} />
                    {liveStatus.label}
                  </p>
                )}
                <div className="space-y-2">
                  <SidebarItem icon={Radio} label={getEditableValue('menu-inicio', t.inicio)} to="/" active={pathname === '/'} collapsed={isSidebarCollapsed} isDark={isDark} />
                  <SidebarItem
                    icon={CalendarDays}
                    label={getEditableValue('menu-programacion', t.programacion)}
                    to="/programacion"
                    active={pathname === '/programacion'}
                    collapsed={isSidebarCollapsed}
                    isDark={isDark}
                  />
                  <SidebarItem icon={Library} label={getEditableValue('menu-biblioteca', t.biblioteca)} to="/biblioteca" active={pathname === '/biblioteca'} collapsed={isSidebarCollapsed} isDark={isDark} />
                  <SidebarItem icon={UserRound} label={getEditableValue('menu-locutores', t.locutores)} to="/locutores" active={pathname === '/locutores'} collapsed={isSidebarCollapsed} isDark={isDark} />
                  <SidebarItem icon={Mic2} label={getEditableValue('menu-podcasts', t.podcasts)} to="/podcasts" active={pathname === '/podcasts'} collapsed={isSidebarCollapsed} isDark={isDark} />
                  <SidebarItem icon={MessageCircle} label={getEditableValue('menu-contacto', t.contacto)} to="/contacto" active={pathname === '/contacto'} collapsed={isSidebarCollapsed} isDark={isDark} />
                </div>

                {!isSidebarCollapsed && (
                  <div className={`mt-auto border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="mb-4">
                      {isAdminAuthenticated ? (
                        <button
                          type="button"
                          onClick={handleAdminLogout}
                          className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
                            isDark
                              ? 'border-emerald-300 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                              : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          Admin activo · Cerrar sesión
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAdminModalOpen(true)}
                          className="w-full rounded-xl border border-[#635BFF]/60 bg-[#635BFF]/20 px-3 py-2 text-xs font-semibold text-[#c8c5ff]"
                        >
                          Ingresar admin (Supabase)
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className={`flex items-center rounded-full border p-1 text-xs font-semibold ${
                        isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-700'
                      }`}>
                        <button
                          onClick={() => setLanguage('es')}
                          className={`rounded-full px-3 py-1 ${language === 'es' ? 'bg-yellow-400 text-slate-900' : ''}`}
                        >
                          ES
                        </button>
                        <button
                          onClick={() => setLanguage('en')}
                          className={`rounded-full px-3 py-1 ${language === 'en' ? 'bg-yellow-400 text-slate-900' : ''}`}
                        >
                          EN
                        </button>
                      </div>

                      <button
                        onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        className={`flex h-8 w-14 items-center rounded-full border p-1 ${isDark ? 'border-slate-700 bg-slate-800 justify-start' : 'border-slate-200 bg-white justify-end'}`}
                        aria-label="Cambiar tema"
                        title="Cambiar tema"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-slate-900">
                          {isDark ? <Moon size={13} /> : <Sun size={13} />}
                        </span>
                      </button>
                    </div>

                  </div>
                )}
              </aside>

              <section>
                <NowOnAirSlider
                  title={t.ahoraCabina}
                  slide={currentSlide}
                  slideKeyPrefix={`slide-${currentSlide.id}`}
                  activeSlide={activeSlide}
                  totalSlides={sliderShows.length}
                  autoplayLabel={isSliderAutoplay ? t.autoplayOn : t.autoplayOff}
                  badge={getSlideBadge(currentSlide.status)}
                  actionLabel={getSlideActionLabel(currentSlide.status)}
                  onAction={() => handleSlideAction(currentSlide)}
                  onPrev={goToPrevSlide}
                  onNext={goToNextSlide}
                  onToggleAutoplay={() => setIsSliderAutoplay((prev) => !prev)}
                  isAdminMode={isAdminMode}
                  getEditableValue={getEditableValue}
                  onEditableChange={updateEditableValue}
                />

                {showProgramacion && (
                  <section className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold">{t.programacion}</h2>
                      {currentView !== 'programacion' && (
                        <button
                          type="button"
                          onClick={handleScheduleSeeAll}
                          className="border-b-2 border-transparent pb-0.5 text-xs font-semibold text-[#635BFF] transition-colors hover:border-yellow-400"
                        >
                          {t.seeAll}
                        </button>
                      )}
                    </div>

                    {currentView === 'programacion' ? (
                      <>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{t.chooseDay}</p>
                        <div className="mt-2 grid grid-cols-7 gap-2">
                          {weeklySchedule.map((day) => {
                            const isActiveDay = activeScheduleDay?.id === day.id

                            return (
                              <button
                                key={day.id}
                                type="button"
                                onClick={() => setSelectedScheduleDay(day.id)}
                                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xs font-semibold transition ${
                                  isActiveDay
                                    ? 'bg-[#635BFF] text-white shadow-[0_10px_18px_rgba(99,91,255,0.35)]'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {day.short}
                              </button>
                            )
                          })}
                        </div>

                        <div className="mt-4">
                          <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{activeScheduleDay.name}</p>
                          <div className="mt-3 space-y-3">
                            {activeScheduleDay.programs.map((program) => (
                              <article key={`${activeScheduleDay.id}-${program.id}`} className={`rounded-xl p-3.5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <EditableText
                                  as="p"
                                  value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-time`, program.time)}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-time`, value)}
                                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400"
                                />
                                <EditableText
                                  as="p"
                                  value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-title`, program.title)}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-title`, value)}
                                  className={`mt-1 text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}
                                />
                                <EditableText
                                  as="p"
                                  value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-description`, program.description)}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-description`, value)}
                                  className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                                />
                              </article>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{t.chooseDay}</p>
                        <div className="mt-2 grid grid-cols-7 gap-2">
                          {weeklySchedule.map((day) => {
                            const isActiveDay = activeScheduleDay?.id === day.id

                            return (
                              <button
                                key={day.id}
                                type="button"
                                onClick={() => setSelectedScheduleDay(day.id)}
                                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xs font-semibold transition ${
                                  isActiveDay
                                    ? 'bg-[#635BFF] text-white shadow-[0_10px_18px_rgba(99,91,255,0.35)]'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {day.short}
                              </button>
                            )
                          })}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {homeSchedulePrograms.map((program) => (
                            <article key={`${activeScheduleDay.id}-${program.id}`} className={`rounded-xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                              <EditableText
                                as="p"
                                value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-time`, program.time)}
                                editable={isAdminMode}
                                onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-time`, value)}
                                className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400"
                              />
                              <EditableText
                                as="p"
                                value={getEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-title`, program.title)}
                                editable={isAdminMode}
                                onSave={(value) => updateEditableValue(`schedule-${activeScheduleDay.id}-${program.id}-title`, value)}
                                className={`mt-1 text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}
                              />
                            </article>
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                )}

                {showBiblioteca && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold">{t.biblioteca}</h2>
                      <button
                        type="button"
                        onClick={handleLibrarySeeAll}
                        className="border-b-2 border-transparent pb-0.5 text-xs font-semibold text-[#635BFF] transition-colors hover:border-yellow-400"
                      >
                        {t.seeAll}
                      </button>
                    </div>

                    {episodeUploadSuccess && (
                      <p className="mb-2 rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
                        {episodeUploadSuccess}
                      </p>
                    )}

                    {episodePlaybackError && (
                      <p className="mb-2 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200">
                        {episodePlaybackError}
                      </p>
                    )}

                    <div className="space-y-3">
                      {continueListening.slice(0, currentView === 'inicio' ? 2 : continueListening.length).map((item) => (
                        <article key={item.id} className={`rounded-2xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          {(() => {
                            const episode = getEditableValue(`library-${item.id}-episode`, item.episode)
                            const title = getEditableValue(`library-${item.id}-title`, item.title)
                            const host = getEditableValue(`library-${item.id}-host`, item.host)
                            const cover = getEditableValue(`library-${item.id}-cover`, item.cover)
                            const isCurrentEpisodePlaying = isEpisodeCurrentlyPlaying('library', item.id)

                            return (
                              <div className="flex items-center gap-3">
                                <EditableImage
                                  src={cover}
                                  alt={title}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`library-${item.id}-cover`, value)}
                                  className="h-16 w-16 rounded-xl object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <EditableText
                                    as="p"
                                    value={episode}
                                    editable={isAdminMode}
                                    onSave={(value) => updateEditableValue(`library-${item.id}-episode`, value)}
                                    className="text-[10px] font-semibold text-slate-400"
                                  />
                                  <EditableText
                                    as="p"
                                    value={title}
                                    editable={isAdminMode}
                                    onSave={(value) => updateEditableValue(`library-${item.id}-title`, value)}
                                    className="truncate text-sm font-semibold"
                                  />
                                  <EditableText
                                    as="p"
                                    value={host}
                                    editable={isAdminMode}
                                    onSave={(value) => updateEditableValue(`library-${item.id}-host`, value)}
                                    className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                                  />
                                </div>
                                {isAdminMode && (
                                  <>
                                    <input
                                      ref={(element) => registerEpisodeAudioInput(`library-${item.id}`, element)}
                                      type="file"
                                      accept="audio/*,.mp3"
                                      className="hidden"
                                      onChange={(event) => {
                                        const nextFile = event.target.files?.[0]
                                        if (nextFile) {
                                          void handleEpisodeAudioUpload('library', item.id, nextFile)
                                        }
                                        event.target.value = ''
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => openEpisodeAudioPicker('library', item.id)}
                                      className="rounded-full bg-[#FF9F3F] p-2 text-white"
                                      aria-label="Subir audio MP3"
                                      title="Subir audio MP3"
                                    >
                                      <Upload size={12} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onPointerDown={handleEpisodePlayPointerDown}
                                  onClick={() => {
                                    void handleEpisodeToggleFromList({ scope: 'library', itemId: item.id, title, host })
                                  }}
                                  className="rounded-full bg-[#635BFF] p-2 text-white"
                                  aria-label={isCurrentEpisodePlaying ? 'Pausar episodio' : 'Reproducir episodio'}
                                  title={isCurrentEpisodePlaying ? 'Pausar episodio' : 'Reproducir episodio'}
                                >
                                  {isCurrentEpisodePlaying ? <Pause size={12} /> : <Play size={12} className="translate-x-0.5" />}
                                </button>
                              </div>
                            )
                          })()}
                          <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <span className="block h-full rounded-full bg-[#20B6FF]" style={{ width: `${item.progress}%` }} />
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {showLocutores && (
                  <HostsSection
                    title={hostsInfo.title}
                    featured={hostsInfo.featured}
                    featuredBadge={hostsInfo.featuredBadge}
                    featuredBadges={hostsInfo.featuredBadges}
                    secondary={hostsInfo.secondary}
                    isDark={isDark}
                    desktop
                    isAdminMode={isAdminMode}
                    getEditableValue={getEditableValue}
                    onEditableChange={updateEditableValue}
                  />
                )}

                {currentView === 'podcasts' && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold">{t.podcasts}</h2>
                      <button
                        type="button"
                        className="border-b-2 border-transparent pb-0.5 text-xs font-semibold text-[#635BFF] transition-colors hover:border-yellow-400"
                      >
                        {t.seeAll}
                      </button>
                    </div>

                    {episodeUploadSuccess && (
                      <p className="mb-2 rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
                        {episodeUploadSuccess}
                      </p>
                    )}

                    {episodePlaybackError && (
                      <p className="mb-2 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200">
                        {episodePlaybackError}
                      </p>
                    )}

                    <div className="space-y-3">
                      {recommended.map((item) => (
                        <article key={item.id} className={`flex items-center gap-3 rounded-2xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          {(() => {
                            const episode = getEditableValue(`podcast-${item.id}-episode`, item.episode)
                            const title = getEditableValue(`podcast-${item.id}-title`, item.title)
                            const host = getEditableValue(`podcast-${item.id}-host`, item.host)
                            const cover = getEditableValue(`podcast-${item.id}-cover`, item.cover)
                            const isCurrentEpisodePlaying = isEpisodeCurrentlyPlaying('podcast', item.id)

                            return (
                              <>
                                <EditableImage
                                  src={cover}
                                  alt={title}
                                  editable={isAdminMode}
                                  onSave={(value) => updateEditableValue(`podcast-${item.id}-cover`, value)}
                                  className="h-14 w-14 rounded-xl object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <EditableText
                                    as="p"
                                    value={episode}
                                    editable={isAdminMode}
                                    onSave={(value) => updateEditableValue(`podcast-${item.id}-episode`, value)}
                                    className="text-[10px] font-semibold text-slate-400"
                                  />
                                  <EditableText
                                    as="p"
                                    value={title}
                                    editable={isAdminMode}
                                    onSave={(value) => updateEditableValue(`podcast-${item.id}-title`, value)}
                                    className="truncate text-sm font-semibold"
                                  />
                                  <EditableText
                                    as="p"
                                    value={host}
                                    editable={isAdminMode}
                                    onSave={(value) => updateEditableValue(`podcast-${item.id}-host`, value)}
                                    className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                                  />
                                </div>
                                {isAdminMode && (
                                  <>
                                    <input
                                      ref={(element) => registerEpisodeAudioInput(`podcast-${item.id}`, element)}
                                      type="file"
                                      accept="audio/*,.mp3"
                                      className="hidden"
                                      onChange={(event) => {
                                        const nextFile = event.target.files?.[0]
                                        if (nextFile) {
                                          void handleEpisodeAudioUpload('podcast', item.id, nextFile)
                                        }
                                        event.target.value = ''
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => openEpisodeAudioPicker('podcast', item.id)}
                                      className="rounded-full bg-[#FF9F3F] p-2 text-white"
                                      aria-label="Subir audio MP3"
                                      title="Subir audio MP3"
                                    >
                                      <Upload size={12} />
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onPointerDown={handleEpisodePlayPointerDown}
                                  onClick={() => {
                                    void handleEpisodeToggleFromList({ scope: 'podcast', itemId: item.id, title, host })
                                  }}
                                  className="rounded-full bg-[#635BFF] p-2 text-white"
                                  aria-label={isCurrentEpisodePlaying ? 'Pausar episodio' : 'Reproducir episodio'}
                                  title={isCurrentEpisodePlaying ? 'Pausar episodio' : 'Reproducir episodio'}
                                >
                                  {isCurrentEpisodePlaying ? <Pause size={12} /> : <Play size={12} className="translate-x-0.5" />}
                                </button>
                              </>
                            )
                          })()}
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {showContacto && (
                  <section className="space-y-4">
                    <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                      <EditableText
                        as="h2"
                        value={getEditableValue('contact-title-desktop', t.contacto)}
                        editable={isAdminMode}
                        onSave={(value) => updateEditableValue('contact-title-desktop', value)}
                        className="text-sm font-semibold"
                      />
                      <EditableText
                        as="p"
                        value={getEditableValue('contact-subtitle-desktop', t.joinChat)}
                        editable={isAdminMode}
                        onSave={(value) => updateEditableValue('contact-subtitle-desktop', value)}
                        className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                      />
                      <div className={`mt-4 rounded-xl p-4 text-sm ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-50 text-slate-700'}`}>
                        <EditableText
                          as="p"
                          value={getEditableValue('contact-whatsapp-label-desktop', 'WhatsApp')}
                          editable={isAdminMode}
                          onSave={(value) => updateEditableValue('contact-whatsapp-label-desktop', value)}
                          className="font-semibold"
                        />
                        <a href="https://wa.me/13475935721" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[#635BFF]">
                          +1 (347) 593-5721
                        </a>
                        <EditableText
                          as="p"
                          value={getEditableValue('contact-location-desktop', 'New York City: Bronx, Manhattan, Queens, Brooklyn y Staten Island.')}
                          editable={isAdminMode}
                          onSave={(value) => updateEditableValue('contact-location-desktop', value)}
                          className={`mt-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                        />
                      </div>
                    </div>

                    <section
                      className={`rounded-2xl border p-4 ${
                        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="mb-3">
                        <h2 className="text-sm font-semibold">Formulario de contacto</h2>
                        <p className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                          Tu mensaje se enviará por correo a ederarmo@gmail.com.
                        </p>
                      </div>

                      <form onSubmit={handleContactSubmit} className="space-y-2">
                        <input
                          type="text"
                          value={contactName}
                          onChange={(event) => setContactName(event.target.value)}
                          placeholder="Tu nombre"
                          required
                          className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                            isDark
                              ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                              : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(event) => setContactEmail(event.target.value)}
                          placeholder="Tu correo"
                          required
                          className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                            isDark
                              ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                              : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                        <input
                          type="text"
                          value={contactSubject}
                          onChange={(event) => setContactSubject(event.target.value)}
                          placeholder="Asunto"
                          className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                            isDark
                              ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                              : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                        <textarea
                          value={contactMessage}
                          onChange={(event) => setContactMessage(event.target.value)}
                          placeholder="Escribe tu mensaje"
                          rows={5}
                          required
                          className={`w-full resize-none rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                            isDark
                              ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                              : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#635BFF] px-3 py-2 text-xs font-semibold text-white"
                        >
                          <Send size={13} />
                          Enviar correo
                        </button>
                      </form>
                    </section>
                  </section>
                )}
              </section>

              <aside className={`space-y-4 ${isPlayerSticky ? 'lg:sticky lg:top-4' : ''}`}>
                <GlobalPlayerCard
                  isPlaying={isPlaying}
                  isExpanded={isPlayerExpanded}
                  isSticky={isPlayerSticky}
                  canSeek={canSeekInPlayer}
                  enableWaveform={isDesktopViewport}
                  mediaElementRef={audioRef}
                  waveformKey={playerWaveformKey}
                  track={currentTrackLabel}
                  show={currentShowLabel}
                  cover={playerCoverImage || DEFAULT_PLAYER_COVER_IMAGE}
                  badge={playerBadge}
                  badgeClassName={playerBadge.className}
                  volume={volume}
                  isMuted={isMuted}
                  elapsed={playerElapsedLabel}
                  duration={playerDurationLabel}
                  progress={playerProgress}
                  playToggleLabel={playerToggleActionLabel}
                  t={t}
                  onPlayToggle={togglePlay}
                  onSkipBackward={() => handleSeekBySeconds(-15)}
                  onSkipForward={() => handleSeekBySeconds(15)}
                  onSeekChange={handleSeekToPercent}
                  onExpand={expandPlayer}
                  onCollapse={collapsePlayer}
                  onMuteToggle={handleToggleMute}
                  onVolumeChange={handleVolumeChange}
                  onShare={handleShare}
                  editableCover={isAdminMode}
                  onCoverSave={(value) => updateEditableValue('player-cover-image', value)}
                />

                <section
                  className={`rounded-2xl border p-4 ${
                    isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="mb-3">
                    <EditableText
                      as="h2"
                      value={getEditableValue('chat-title-right', t.liveChat)}
                      editable={isAdminMode}
                      onSave={(value) => updateEditableValue('chat-title-right', value)}
                      className="text-sm font-semibold"
                    />
                    <EditableText
                      as="p"
                      value={getEditableValue('chat-subtitle-right', t.joinChat)}
                      editable={isAdminMode}
                      onSave={(value) => updateEditableValue('chat-subtitle-right', value)}
                      className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                    />
                  </div>

                  <input
                    type="text"
                    value={chatName}
                    onChange={(event) => setChatName(event.target.value)}
                    placeholder={t.tuNombre}
                    className={`mb-2 w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                        : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                    }`}
                  />

                  <div
                    className={`mb-2 h-40 overflow-y-auto rounded-lg border p-2 ${
                      isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="space-y-2">
                      {chatMessages.map((message) => (
                        <article key={message.id} className={`rounded-md p-2 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`truncate text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{message.name}</p>
                            <span className="text-[10px] text-slate-400">{message.time}</span>
                          </div>
                          <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{message.text}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(event) => setChatMessage(event.target.value)}
                      placeholder={t.escribeMensaje}
                      className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#635BFF]/30 ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400'
                          : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#635BFF] px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Send size={13} />
                      {t.enviar}
                    </button>
                  </form>
                </section>
              </aside>
            </div>
          </>
      </main>

      <SiteFooter
        logo={logoRadio}
        t={t}
        isDark={isDark}
        sitemapLinks={mainMenuLinks.map(({ to, label }) => ({ to, label }))}
        isAdminMode={isAdminMode}
        getEditableValue={getEditableValue}
        updateEditableValue={updateEditableValue}
      />
    </div>
  )
}

function EditableText({ as = 'p', value, editable = false, onSave, className = '' }) {
  const Component = as

  return (
    <Component
      className={`${className} ${editable ? 'cursor-text rounded focus:outline-none focus:ring-1 focus:ring-[#635BFF]/60' : ''}`.trim()}
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={(event) => {
        if (!editable) return
        const nextValue = event.currentTarget.textContent || ''
        onSave?.(nextValue)
      }}
    >
      {value}
    </Component>
  )
}

function EditableImage({ src, alt, editable = false, onSave, className = '', fallbackSrc = '' }) {
  const inputRef = useRef(null)

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} ${editable ? 'cursor-pointer ring-2 ring-transparent transition hover:ring-[#635BFF]/60' : ''}`.trim()}
        onError={(event) => {
          if (!fallbackSrc) return
          if (event.currentTarget.getAttribute('src') === fallbackSrc) return
          event.currentTarget.setAttribute('src', fallbackSrc)
        }}
        onClick={() => {
          if (!editable) return
          inputRef.current?.click()
        }}
      />
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result
              if (typeof result === 'string') {
                onSave?.(result)
              }
            }
            reader.readAsDataURL(file)
            event.target.value = ''
          }}
        />
      )}
    </>
  )
}

function NowOnAirSlider({
  title,
  slide,
  slideKeyPrefix,
  activeSlide,
  totalSlides,
  autoplayLabel,
  badge,
  isEpisodeAction = false,
  actionLabel,
  onAction,
  onPrev,
  onNext,
  onToggleAutoplay,
  isAdminMode = false,
  getEditableValue,
  onEditableChange,
}) {
  const slideImage = getEditableValue ? getEditableValue(`${slideKeyPrefix}-image`, slide.image) : slide.image
  const slideTitle = getEditableValue ? getEditableValue(`${slideKeyPrefix}-title`, slide.title) : slide.title
  const slideSchedule = getEditableValue ? getEditableValue(`${slideKeyPrefix}-schedule`, slide.schedule) : slide.schedule
  const slideDescription = getEditableValue ? getEditableValue(`${slideKeyPrefix}-description`, slide.description) : slide.description

  return (
    <section className="slider-transition mb-5 overflow-hidden rounded-2xl bg-[#635BFF] text-white">
      <div className="relative">
        <EditableImage
          src={slideImage}
          alt={slideTitle}
          editable={isAdminMode}
          onSave={(value) => onEditableChange?.(`${slideKeyPrefix}-image`, value)}
          className="h-52 w-full object-cover opacity-35 lg:h-56"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2f2ab5]/95 via-[#4f46e5]/70 to-[#4f46e5]/20" />

        <div className="absolute inset-0 p-4 pb-20 lg:p-6 lg:pb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">{title}</p>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <button
              onClick={onToggleAutoplay}
              className="rounded-full border border-white/40 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white"
            >
              {autoplayLabel}
            </button>
          </div>

          <div className="mt-3 max-w-[80%] lg:mt-5">
            <EditableText
              as="h2"
              value={slideTitle}
              editable={isAdminMode}
              onSave={(value) => onEditableChange?.(`${slideKeyPrefix}-title`, value)}
              className="text-xl font-semibold leading-tight lg:text-3xl"
            />
            <EditableText
              as="p"
              value={slideSchedule}
              editable={isAdminMode}
              onSave={(value) => onEditableChange?.(`${slideKeyPrefix}-schedule`, value)}
              className="mt-1 text-xs font-semibold text-white/85 lg:text-sm"
            />
            <EditableText
              as="p"
              value={slideDescription}
              editable={isAdminMode}
              onSave={(value) => onEditableChange?.(`${slideKeyPrefix}-description`, value)}
              className="mt-1 text-xs text-white/80 lg:text-sm"
            />
            <button
              data-audio-trigger={isEpisodeAction ? 'episode' : undefined}
              onClick={onAction}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-xs font-semibold text-slate-900 lg:text-sm"
            >
              <Radio size={14} />
              {actionLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/20 bg-[#423acd]/80 px-4 py-2">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <span
              key={`dot-${index}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="rounded-full border border-white/40 p-1.5 text-white">
            <ChevronLeft size={14} />
          </button>
          <button onClick={onNext} className="rounded-full border border-white/40 p-1.5 text-white">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  )
}

function HostsSection({
  title,
  featured,
  featuredBadge,
  featuredBadges = [],
  secondary = [],
  isDark,
  desktop = false,
  isAdminMode = false,
  getEditableValue,
  onEditableChange,
}) {
  const sectionTitle = getEditableValue ? getEditableValue('hosts-section-title', title) : title
  const featuredImage = getEditableValue ? getEditableValue('hosts-featured-image', featured.image) : featured.image
  const featuredName = getEditableValue ? getEditableValue('hosts-featured-name', featured.name) : featured.name
  const featuredRole = getEditableValue ? getEditableValue('hosts-featured-role', featured.role) : featured.role
  const featuredDescription = getEditableValue
    ? getEditableValue('hosts-featured-description', featured.description)
    : featured.description
  const featuredPrimaryBadge = getEditableValue
    ? getEditableValue('hosts-featured-badge-primary', featuredBadge)
    : featuredBadge

  return (
    <section className={`${desktop ? 'mb-6' : 'mb-5'} hosts-section`}>
      <div className="mb-3 flex items-center justify-between">
        <EditableText
          as="h2"
          value={sectionTitle}
          editable={isAdminMode}
          onSave={(value) => onEditableChange?.('hosts-section-title', value)}
          className="text-sm font-semibold"
        />
      </div>

      <article className={`hosts-featured-card rounded-2xl border p-3 lg:p-4 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="hosts-featured-layout gap-3 lg:gap-4">
          <EditableImage
            src={featuredImage}
            alt={featuredName}
            editable={isAdminMode}
            onSave={(value) => onEditableChange?.('hosts-featured-image', value)}
            className="hosts-featured-image h-full w-full rounded-xl object-cover"
          />

          <div className="hosts-featured-content min-w-0 rounded-xl p-3 lg:p-4">
            <span
              className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                isDark
                  ? 'border border-[#635BFF]/45 bg-[#635BFF]/20 text-[#c8c5ff]'
                  : 'border border-[#4338ca] bg-[#4f46e5] text-white'
              }`}
            >
              <EditableText
                as="span"
                value={featuredPrimaryBadge}
                editable={isAdminMode}
                onSave={(value) => onEditableChange?.('hosts-featured-badge-primary', value)}
              />
            </span>
            <EditableText
              as="h3"
              value={featuredName}
              editable={isAdminMode}
              onSave={(value) => onEditableChange?.('hosts-featured-name', value)}
              className="text-lg font-semibold leading-tight lg:text-xl"
            />
            <EditableText
              as="p"
              value={featuredRole}
              editable={isAdminMode}
              onSave={(value) => onEditableChange?.('hosts-featured-role', value)}
              className={`mt-1 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
            />
            <EditableText
              as="p"
              value={featuredDescription}
              editable={isAdminMode}
              onSave={(value) => onEditableChange?.('hosts-featured-description', value)}
              className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {featuredBadges.map((badgeLabel, badgeIndex) => {
                const badgeKey = `hosts-featured-badge-${badgeIndex + 1}`
                const currentBadgeLabel = getEditableValue ? getEditableValue(badgeKey, badgeLabel) : badgeLabel

                return (
                <span
                  key={badgeKey}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                    isDark ? 'border border-lime-300/35 bg-lime-300/15 text-lime-200' : 'border border-slate-900 bg-slate-900 text-white'
                  }`}
                >
                  <EditableText
                    as="span"
                    value={currentBadgeLabel}
                    editable={isAdminMode}
                    onSave={(value) => onEditableChange?.(badgeKey, value)}
                  />
                </span>
                )
              })}
            </div>
          </div>
        </div>
      </article>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {secondary.map((host, index) => (
          (() => {
            const hostImageKey = `hosts-secondary-${host.id}-image`
            const hostNameKey = `hosts-secondary-${host.id}-name`
            const hostRoleKey = `hosts-secondary-${host.id}-role`
            const hostDescriptionKey = `hosts-secondary-${host.id}-description`
            const hostImage = getEditableValue ? getEditableValue(hostImageKey, host.image) : host.image
            const hostName = getEditableValue ? getEditableValue(hostNameKey, host.name) : host.name
            const hostRole = getEditableValue ? getEditableValue(hostRoleKey, host.role) : host.role
            const hostDescription = getEditableValue ? getEditableValue(hostDescriptionKey, host.description) : host.description

            return (
              <article
                key={host.id}
                className={`hosts-secondary-card hosts-animate-in rounded-2xl border p-3 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}
                style={{ animationDelay: `${index * 100 + 80}ms` }}
              >
                <EditableImage
                  src={hostImage}
                  alt={hostName}
                  editable={isAdminMode}
                  onSave={(value) => onEditableChange?.(hostImageKey, value)}
                  className="hosts-secondary-image h-36 w-full rounded-xl object-cover"
                />
                <EditableText
                  as="h4"
                  value={hostName}
                  editable={isAdminMode}
                  onSave={(value) => onEditableChange?.(hostNameKey, value)}
                  className="mt-3 text-sm font-semibold"
                />
                <EditableText
                  as="p"
                  value={hostRole}
                  editable={isAdminMode}
                  onSave={(value) => onEditableChange?.(hostRoleKey, value)}
                  className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                />
                <EditableText
                  as="p"
                  value={hostDescription}
                  editable={isAdminMode}
                  onSave={(value) => onEditableChange?.(hostDescriptionKey, value)}
                  className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                />
              </article>
            )
          })()
        ))}
      </div>
    </section>
  )
}

function GlobalPlayerCard({
  isPlaying,
  isExpanded,
  isSticky,
  canSeek = false,
  enableWaveform = true,
  mediaElementRef,
  waveformKey,
  track,
  show,
  cover,
  badge,
  badgeClassName,
  volume,
  isMuted,
  elapsed,
  duration = null,
  progress,
  playToggleLabel,
  t,
  onPlayToggle,
  onSkipBackward,
  onSkipForward,
  onSeekChange,
  onExpand,
  onCollapse,
  onMuteToggle,
  onVolumeChange,
  onShare,
  editableCover = false,
  onCoverSave,
  mobile = false,
}) {
  const shouldFloatMobile = mobile && isSticky && isPlaying
  const showExpandedState = isExpanded
  const shouldRenderWaveform = enableWaveform && canSeek
  const waveformExpandedContainerRef = useRef(null)
  const waveformCompactContainerRef = useRef(null)
  const waveSurferRef = useRef(null)
  const [isWaveformReady, setIsWaveformReady] = useState(false)

  useEffect(() => {
    if (!shouldRenderWaveform) {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy()
        waveSurferRef.current = null
      }
      setIsWaveformReady(false)
      return
    }

    const media = mediaElementRef?.current
    const container = showExpandedState ? waveformExpandedContainerRef.current : waveformCompactContainerRef.current
    if (!media || !container) return

    let isCancelled = false
    let waveSurfer = null

    const initializeWaveform = async () => {
      const { default: WaveSurfer } = await import('wavesurfer.js')
      if (isCancelled) return

      waveSurfer = WaveSurfer.create({
        container,
        media,
        height: 38,
        waveColor: 'rgba(255,255,255,0.45)',
        progressColor: '#A3E635',
        cursorColor: 'transparent',
        barWidth: 3,
        barGap: 2,
        barRadius: 4,
        normalize: true,
        dragToSeek: true,
        interact: true,
      })

      waveSurferRef.current = waveSurfer
      waveSurfer.on('ready', () => {
        setIsWaveformReady(true)
      })
    }

    initializeWaveform()

    return () => {
      isCancelled = true
      if (waveSurfer) {
        waveSurfer.destroy()
      }
      if (waveSurferRef.current === waveSurfer) {
        waveSurferRef.current = null
      }
      setIsWaveformReady(false)
    }
  }, [mediaElementRef, shouldRenderWaveform, showExpandedState, waveformKey])

  return (
    <section
      className={`global-player-card player-transition mb-4 overflow-hidden p-4 text-white ${
        shouldFloatMobile ? 'fixed bottom-4 left-4 right-4 z-50' : ''
      } ${showExpandedState ? 'min-h-[320px]' : 'min-h-[190px]'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">{t.nowPlaying}</p>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${badgeClassName || 'bg-white/20 text-white'}`}>
          {badge?.label || badge}
        </span>
      </div>

      <EditableImage
        src={cover || DEFAULT_PLAYER_COVER_IMAGE}
        alt={track}
        editable={editableCover}
        onSave={onCoverSave}
        fallbackSrc={DEFAULT_PLAYER_COVER_IMAGE}
        className="player-cover mt-3 w-full object-cover"
      />

      <div className="mt-3 text-center">
        <h3 className="truncate text-sm font-semibold">{track}</h3>
        <p className="truncate text-xs text-white/80">{show}</p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {canSeek && (
          <button
            type="button"
            onClick={onSkipBackward}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            aria-label="Retroceder 15 segundos"
            title="Retroceder 15 segundos"
          >
            <RotateCcw size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={async () => {
            await onPlayToggle()
            if (!isPlaying) {
              onExpand()
            }
          }}
          className="player-main-button flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#635BFF]"
          aria-label={playToggleLabel || (isPlaying ? t.reproduciendo : t.reproducir)}
          title={playToggleLabel || (isPlaying ? t.reproduciendo : t.reproducir)}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
        </button>
        {canSeek && (
          <button
            type="button"
            onClick={onSkipForward}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            aria-label="Adelantar 15 segundos"
            title="Adelantar 15 segundos"
          >
            <RotateCw size={14} />
          </button>
        )}
      </div>

      {showExpandedState && (
        <div className="player-expanded mt-4 border-t border-white/20 pt-3">
          {shouldRenderWaveform ? (
            <div className="mt-1 rounded-full bg-white/10 px-3 py-2">
              <div ref={waveformExpandedContainerRef} className="h-[42px] w-full" />

              {!isWaveformReady && (
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={(event) => onSeekChange?.(event.target.value)}
                    className="h-1.5 w-full cursor-pointer accent-lime-300"
                    aria-label="Progreso del episodio"
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex h-8 items-end gap-1 rounded-full bg-white/10 px-3 py-1">
                <span className="wave-bar wave-bar-active" style={{ animationDelay: '0ms' }} />
                <span className="wave-bar wave-bar-active" style={{ animationDelay: '120ms' }} />
                <span className="wave-bar wave-bar-active" style={{ animationDelay: '240ms' }} />
                <span className="wave-bar wave-bar-active" style={{ animationDelay: '360ms' }} />
                <span className="wave-bar wave-bar-active" style={{ animationDelay: '480ms' }} />
                <span className="wave-bar wave-bar-active" style={{ animationDelay: '600ms' }} />
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                <span className="block h-full rounded-full bg-lime-300" style={{ width: `${progress}%` }} />
              </div>
            </>
          )}

          {shouldRenderWaveform && !isWaveformReady && (
            <div className="mt-2 text-center text-[10px] text-white/70">Cargando forma de onda…</div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <span>{duration ? `${elapsed} / ${duration}` : elapsed}</span>
            <div className="flex items-center gap-2">
              <button onClick={onMuteToggle} className="rounded-full bg-white/15 p-1.5" aria-label={isMuted ? t.unmute : t.mute}>
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={onVolumeChange}
                className="h-1.5 w-20 accent-lime-300"
                aria-label={t.volumen}
              />
              <button onClick={onShare} className="rounded-full bg-white/15 p-1.5" aria-label={t.compartir}>
                <Share2 size={13} />
              </button>
              <button onClick={onCollapse} className="rounded-full bg-white/15 p-1.5" aria-label={t.minimizar}>
                <Minimize2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!showExpandedState && (
        <div className="mt-3 space-y-2">
          {shouldRenderWaveform ? (
            <div className="rounded-full bg-white/10 px-3 py-1.5">
              <div ref={waveformCompactContainerRef} className="h-[24px] w-full" />
              {!isWaveformReady && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={(event) => onSeekChange?.(event.target.value)}
                  className="h-1.5 w-full cursor-pointer accent-lime-300"
                  aria-label="Progreso del episodio"
                />
              )}
            </div>
          ) : canSeek ? (
            <div className="rounded-full bg-white/10 px-3 py-1.5">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={(event) => onSeekChange?.(event.target.value)}
                className="h-1.5 w-full cursor-pointer accent-lime-300"
                aria-label="Progreso del episodio"
              />
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onExpand}
              className="rounded-full border border-white/40 bg-white/10 px-2.5 py-1 text-[10px] font-semibold"
            >
              {t.expandir}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function NavItem({ icon, label, active = false, onClick, to = '/', isDark = false }) {
  const Icon = icon

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 text-[10px] ${active ? 'text-[#635BFF]' : isDark ? 'text-slate-300' : 'text-slate-500'}`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </Link>
  )
}

function PlayerNavItem({ isPlaying, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-11 min-w-24 items-center justify-center gap-1 rounded-full bg-red-500 px-3 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.35)]"
      aria-label={isPlaying ? 'Stop' : 'Play'}
      title={isPlaying ? 'Stop' : 'Play'}
    >
      {isPlaying ? <Pause size={13} /> : <Play size={13} className="translate-x-0.5" />}
      <span>{isPlaying ? 'Stop' : 'Play'}</span>
    </button>
  )
}

function SidebarItem({ icon, label, active = false, collapsed = false, to = '/', isDark = false }) {
  const Icon = icon

  return (
    <Link
      to={to}
      className={`flex w-full items-center rounded-xl py-2 text-sm font-medium ${
        collapsed ? 'justify-center px-0' : 'gap-3 px-3 text-left'
      } ${active ? 'bg-[#635BFF] text-white' : isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'}`}
      aria-label={label}
      title={label}
    >
      <Icon size={17} />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}

function SiteFooter({ logo, t, isDark, sitemapLinks, isAdminMode = false, getEditableValue, updateEditableValue }) {
  const [isLinksOpen, setIsLinksOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isLegalOpen, setIsLegalOpen] = useState(false)

  return (
    <footer
      className={`mx-auto mt-3 w-full max-w-[390px] overflow-hidden rounded-3xl lg:mt-6 lg:max-w-6xl ${
        isDark ? 'bg-slate-950 text-slate-100' : 'border border-slate-200 bg-white text-slate-900'
      }`}
    >
      <div className="grid gap-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <section>
          <div className="mb-3">
            <img src={logo} alt="Tu Radio Latina" className="h-12 w-auto object-contain" />
          </div>
          <EditableText
            as="p"
            value={getEditableValue?.('footer-description', t.footerDescription) ?? t.footerDescription}
            editable={isAdminMode}
            onSave={(value) => updateEditableValue?.('footer-description', value)}
            className={`max-w-[220px] text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
          />
        </section>

        <section>
          <button
            onClick={() => setIsLinksOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left sm:cursor-default"
            aria-expanded={isLinksOpen}
          >
            <EditableText
              as="h3"
              value={getEditableValue?.('footer-sitemap-title', t.enlaces) ?? t.enlaces}
              editable={isAdminMode}
              onSave={(value) => updateEditableValue?.('footer-sitemap-title', value)}
              className="text-lg font-semibold"
            />
            <ChevronDown size={18} className={`transition-transform sm:hidden ${isLinksOpen ? 'rotate-180' : ''}`} />
          </button>
          <ul className={`mt-3 space-y-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'} ${isLinksOpen ? 'block' : 'hidden'} sm:block`}>
            {sitemapLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="border-b-2 border-transparent pb-0.5 text-left transition-colors hover:border-yellow-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <button
            onClick={() => setIsContactOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left sm:cursor-default"
            aria-expanded={isContactOpen}
          >
            <EditableText
              as="h3"
              value={getEditableValue?.('footer-contact-title', t.contacto) ?? t.contacto}
              editable={isAdminMode}
              onSave={(value) => updateEditableValue?.('footer-contact-title', value)}
              className="text-lg font-semibold"
            />
            <ChevronDown size={18} className={`transition-transform sm:hidden ${isContactOpen ? 'rotate-180' : ''}`} />
          </button>
          <ul className={`mt-3 space-y-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'} ${isContactOpen ? 'block' : 'hidden'} sm:block`}>
            <li>
              <a
                href="https://wa.me/13475935721"
                target="_blank"
                rel="noreferrer"
                className="border-b-2 border-transparent pb-0.5 text-left transition-colors hover:border-yellow-400"
              >
                WhatsApp
              </a>
            </li>
            <li><Link to="/contacto" className="border-b-2 border-transparent pb-0.5 text-left transition-colors hover:border-yellow-400">{t.publicidad}</Link></li>
            <li><Link to="/contacto" className="border-b-2 border-transparent pb-0.5 text-left transition-colors hover:border-yellow-400">{t.colaboraciones}</Link></li>
            <li>
              <a href="https://wa.me/13475935721" target="_blank" rel="noreferrer" className="border-b-2 border-transparent pb-0.5 text-left transition-colors hover:border-yellow-400">
                +1 (347) 593-5721
              </a>
            </li>
            <li>
              <EditableText
                as="span"
                value={getEditableValue?.('footer-contact-location', 'New York City: Bronx, Manhattan, Queens, Brooklyn y Staten Island.') ?? 'New York City: Bronx, Manhattan, Queens, Brooklyn y Staten Island.'}
                editable={isAdminMode}
                onSave={(value) => updateEditableValue?.('footer-contact-location', value)}
                className="inline-block"
              />
            </li>
          </ul>
        </section>

        <section>
          <button
            onClick={() => setIsLegalOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left sm:cursor-default"
            aria-expanded={isLegalOpen}
          >
            <EditableText
              as="h3"
              value={getEditableValue?.('footer-legal-title', t.legalRedes) ?? t.legalRedes}
              editable={isAdminMode}
              onSave={(value) => updateEditableValue?.('footer-legal-title', value)}
              className="text-lg font-semibold"
            />
            <ChevronDown size={18} className={`transition-transform sm:hidden ${isLegalOpen ? 'rotate-180' : ''}`} />
          </button>
          <ul className={`mt-3 space-y-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'} ${isLegalOpen ? 'block' : 'hidden'} sm:block`}>
            <li><Link to="/privacidad" className="border-b-2 border-transparent pb-0.5 text-left transition-colors hover:border-yellow-400">{t.politica}</Link></li>
            <li><Link to="/terminos" className="border-b-2 border-transparent pb-0.5 text-left transition-colors hover:border-yellow-400">{t.terminos}</Link></li>
          </ul>
        </section>
      </div>

      <div
        className={`flex flex-col gap-3 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8 ${
          isDark ? 'border-t border-slate-800 text-slate-300' : 'border-t border-slate-200 text-slate-600'
        }`}
      >
        <p>
          ©{new Date().getFullYear()} Tu Radio Latina. {t.derechos}
        </p>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <EditableText
            as="p"
            value={getEditableValue?.('footer-line', t.footerLine) ?? t.footerLine}
            editable={isAdminMode}
            onSave={(value) => updateEditableValue?.('footer-line', value)}
            className={`hidden md:block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
          />
          <a href="https://wa.me/13475935721" target="_blank" rel="noreferrer" className="rounded-full bg-yellow-400 px-5 py-2 font-semibold text-slate-900">
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}

export default App
