import {
  type CSSProperties,
  type PointerEvent,
  type WheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Armchair,
  BatteryCharging,
  Bell,
  Bluetooth,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudFog,
  Disc3,
  Download,
  Droplets,
  Gift,
  Gamepad2,
  Gauge,
  Lightbulb,
  LocateFixed,
  Lock,
  MapPinned,
  MessageCircle,
  Minus,
  Monitor,
  MoreHorizontal,
  Navigation2,
  BriefcaseBusiness,
  Heart,
  House,
  Pause,
  Play,
  Phone,
  Plus,
  Repeat2,
  RotateCcw,
  Route,
  Search,
  Shield,
  Shuffle,
  SkipBack,
  SkipForward,
  ShoppingBag,
  Signal,
  SlidersHorizontal,
  TriangleAlert,
  Unlock,
  User,
  Video,
  Volume2,
  VolumeX,
  Wifi,
  Wind,
  WindArrowDown,
  Wrench,
  type LucideIcon
} from 'lucide-react';
import './styles.css';
import navIcon from './assets/reference/teslaui/icons/nav.svg';
import calendarIcon from './assets/reference/teslaui/icons/calendar.svg';
import energyIcon from './assets/reference/teslaui/icons/energy.svg';
import spotifyIcon from './assets/reference/teslaui/icons/spotify.svg';
import theaterIcon from './assets/reference/teslaui/assets/png/theather.png';
import tireCarImage from './assets/reference/teslaui/assets/png/whichTire-car-dark.png';
import modelYRedImage from './assets/reference/teslaui/compositor/MTY70_PR01_WY21A_IPW10__my.png';
import cybercabImage from './assets/reference/teslaui/compositor/cybercab.png';

type RightPaneMode = 'MAP' | 'SETTINGS' | 'APP';
type SettingsCategory =
  | 'CONTROLS'
  | 'DYNAMICS'
  | 'CHARGING'
  | 'AUTOPILOT'
  | 'LOCKS'
  | 'LIGHTS'
  | 'SEATS'
  | 'DISPLAY'
  | 'SCHEDULE'
  | 'SAFETY'
  | 'SERVICE'
  | 'SOFTWARE'
  | 'NAVIGATION'
  | 'TRIPS'
  | 'WIFI'
  | 'BLUETOOTH'
  | 'AUDIO'
  | 'UPGRADES';

type SettingValue = boolean | number | string;

interface OverlayState {
  isLauncherOpen: boolean;
  isKeyboardOpen: boolean;
}

interface DriveState {
  gear: 'P' | 'R' | 'N' | 'D';
  speed: number;
  speedLimit: number;
  charging: boolean;
  batteryPercent: number;
  cyberMode: boolean;
}

interface ClimateState {
  driverTemp: number;
  passengerTemp: number;
}

interface AudioState {
  volumeLevel: number;
  previousVolumeLevel: number;
}

interface MapViewport {
  zoom: number;
  panX: number;
  panY: number;
}

interface SampleStreet {
  id: string;
  x: number;
  y: number;
  length: number;
  angle: number;
  level: 'major' | 'minor' | 'local';
}

interface SampleStreetLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  angle: number;
  tone: 'major' | 'minor';
}

interface SamplePoi {
  id: string;
  x: number;
  y: number;
  type: 'park' | 'food' | 'charge' | 'pin';
}

interface NavigationStep {
  distance: string;
  instruction: string;
}

interface NavigationState {
  active: boolean;
  query: string;
  destination: string;
  currentStep: NavigationStep;
  nextSteps: NavigationStep[];
  eta: string;
  distance: string;
  batteryAtArrival: string;
}

interface MediaState {
  track: string;
  artist: string;
  progress: number;
  duration: number;
  isPlaying: boolean;
  isFavorite: boolean;
  isExpanded: boolean;
}

interface VehicleStatus {
  lightsOn: boolean;
  fogOn: boolean;
  autoHighBeamOn: boolean;
  seatbeltWarning: boolean;
  locked: boolean;
  frunkOpen: boolean;
  trunkOpen: boolean;
}

interface SettingsState {
  activeCategory: SettingsCategory;
  values: Record<string, SettingValue>;
}

interface AppTile {
  id: string;
  label: string;
  glyph: string;
  iconSrc?: string;
  icon?: LucideIcon;
}

const APP_TILES: AppTile[] = [
  { id: 'dashcam', label: 'Dashcam', glyph: 'DC', icon: Camera },
  { id: 'calendar', label: 'Calendar', glyph: 'CA', iconSrc: calendarIcon },
  { id: 'messages', label: 'Messages', glyph: 'MS', icon: MessageCircle },
  { id: 'zoom', label: 'Zoom', glyph: 'ZM', icon: Video },
  { id: 'theater', label: 'Theater', glyph: 'TH', iconSrc: theaterIcon },
  { id: 'toybox', label: 'Toybox', glyph: 'TB', icon: Gift },
  { id: 'spotify', label: 'Spotify', glyph: 'SP', iconSrc: spotifyIcon },
  { id: 'energy', label: 'Energy', glyph: 'EN', iconSrc: energyIcon },
  { id: 'settings', label: 'Settings', glyph: 'ST', icon: SlidersHorizontal }
];

const SETTINGS_CATEGORY_META: Record<
  SettingsCategory,
  { label: string; icon: LucideIcon }
> = {
  CONTROLS: { label: 'Controls', icon: SlidersHorizontal },
  DYNAMICS: { label: 'Pedals & Steering', icon: Gauge },
  CHARGING: { label: 'Charging', icon: BatteryCharging },
  AUTOPILOT: { label: 'Autopilot', icon: Navigation2 },
  LOCKS: { label: 'Locks', icon: Lock },
  LIGHTS: { label: 'Lights', icon: Lightbulb },
  SEATS: { label: 'Seats', icon: Armchair },
  DISPLAY: { label: 'Display', icon: Monitor },
  SCHEDULE: { label: 'Schedule', icon: Clock3 },
  SAFETY: { label: 'Safety', icon: Shield },
  SERVICE: { label: 'Service', icon: Wrench },
  SOFTWARE: { label: 'Software', icon: Download },
  NAVIGATION: { label: 'Navigation', icon: MapPinned },
  TRIPS: { label: 'Trips', icon: Route },
  WIFI: { label: 'Wi-Fi', icon: Wifi },
  BLUETOOTH: { label: 'Bluetooth', icon: Bluetooth },
  AUDIO: { label: 'Audio', icon: Volume2 },
  UPGRADES: { label: 'Upgrades', icon: ShoppingBag }
};

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  'CONTROLS',
  'DYNAMICS',
  'CHARGING',
  'AUTOPILOT',
  'LOCKS',
  'LIGHTS',
  'SEATS',
  'DISPLAY',
  'SCHEDULE',
  'SAFETY',
  'SERVICE',
  'SOFTWARE',
  'NAVIGATION',
  'TRIPS',
  'WIFI',
  'BLUETOOTH',
  'AUDIO',
  'UPGRADES'
];

const INITIAL_NAVIGATION: NavigationState = {
  active: false,
  query: '',
  destination: 'Downtown Charging Hub',
  currentStep: {
    distance: '200 ft',
    instruction: 'Turn right onto Juniper Ave'
  },
  nextSteps: [
    { distance: '0.3 mi', instruction: 'Keep left to stay on Juniper Ave' },
    { distance: '1.4 mi', instruction: 'Take exit 24 toward Downtown' },
    { distance: '2.0 mi', instruction: 'Destination will be on your right' }
  ],
  eta: '10:42 AM',
  distance: '7.1 mi',
  batteryAtArrival: '74%'
};

const INITIAL_MEDIA: MediaState = {
  track: 'A PERFECT WORLD',
  artist: 'The Kid LAROI',
  progress: 74,
  duration: 214,
  isPlaying: true,
  isFavorite: false,
  isExpanded: false
};

const INITIAL_SETTINGS: SettingsState = {
  activeCategory: 'CONTROLS',
  values: {
    'controls-headlights': 'AUTO',
    'controls-wipers-mode': 'AUTO',
    'controls-fold-mirrors': false,
    'controls-child-lock': false,
    'controls-window-lock': true,
    'controls-glovebox-open': false,
    'controls-auto-high-beam': false,
    'controls-sentry-mode': false,
    'controls-dashcam-auto-save': true,
    'controls-mirror-select': 'LEFT',
    'controls-mirror-angle': 0,
    'controls-steering-height': 0,
    'controls-steering-reach': 0,
    'dynamics-acceleration': 'STANDARD',
    'dynamics-steering-mode': 'STANDARD',
    'dynamics-stopping-mode': 'HOLD',
    'dynamics-slip-start': false,
    'dynamics-track-mode': false,
    'dynamics-regen-braking': true,
    'charging-charge-limit': 80,
    'charging-current-amps': 30,
    'charging-scheduled-charging': false,
    'charging-off-peak': false,
    'charging-precondition': true,
    'charging-trip-planner-precondition': true,
    'autopilot-autosteer-beta': true,
    'autopilot-navigate-on-autopilot': true,
    'autopilot-auto-lane-change': true,
    'autopilot-traffic-light-stop': true,
    'autopilot-summon-standby': false,
    'autopilot-fsd-profile': 'AVERAGE',
    'autopilot-forward-collision-warning': 'MEDIUM',
    'autopilot-lane-departure-avoidance': 'ASSIST',
    'autopilot-speed-limit-warning': 'DISPLAY',
    'autopilot-emergency-lane-departure': true,
    'autopilot-blind-spot-camera': true,
    'autopilot-automatic-emergency-braking': true,
    'autopilot-obstacle-aware-acceleration': true,
    'autopilot-following-distance': 4,
    'locks-walk-away': true,
    'locks-unlock-on-park': true,
    'locks-driver-door-unlock': false,
    'locks-child-lock': false,
    'locks-lock-sound': true,
    'locks-valet-mode': false,
    'lights-headlights': 'AUTO',
    'lights-dome-auto': true,
    'lights-auto-high-beam': false,
    'lights-fog-lights': true,
    'lights-ambient-lights': true,
    'seats-driver-heat': 1,
    'seats-passenger-heat': 1,
    'seats-easy-entry': true,
    'seats-rear-heaters': true,
    'seats-seatbelt-reminder': true,
    'display-brightness': 72,
    'display-appearance': 'AUTO',
    'display-night-shift': true,
    'display-distance-unit': 'MI',
    'display-temperature-unit': 'F',
    'display-clock-format': '12H',
    'display-language': 'EN',
    'display-range-view': 'EST',
    'schedule-off-peak': false,
    'schedule-departure-days': 'WEEKDAYS',
    'schedule-departure-hour': 7,
    'schedule-precondition': true,
    'schedule-cabin-overheat': false,
    'safety-sentry-mode': false,
    'safety-security-alarm': true,
    'safety-pin-to-drive': false,
    'safety-speed-limit-warning': 'DISPLAY',
    'safety-parental-controls': false,
    'service-front-left-psi': 42,
    'service-front-right-psi': 42,
    'service-rear-left-psi': 40,
    'service-rear-right-psi': 40,
    'service-car-wash-mode': false,
    'service-wiper-service-mode': false,
    'service-camera-calibrating': false,
    'software-version': '2026.4.2',
    'software-update-channel': 'STANDARD',
    'software-beta-updates': false,
    'software-auto-download': true,
    'software-last-check': 'Today 10:21 AM',
    'software-checking-update': false,
    'navigation-online-routing': true,
    'navigation-avoid-tolls': false,
    'navigation-avoid-highways': false,
    'navigation-avoid-ferries': true,
    'navigation-map-color': 'AUTO',
    'navigation-voice-guidance': 'NORMAL',
    'navigation-home-work-suggestions': true,
    'trips-since-charge': '152.4 mi',
    'trips-trip-a': '34.1 mi',
    'trips-trip-b': '298.7 mi',
    'wifi-enabled': true,
    'wifi-network-name': 'Garage-5G',
    'wifi-auto-join': true,
    'wifi-searching': false,
    'bluetooth-enabled': true,
    'bluetooth-phone-key': true,
    'bluetooth-primary-device': 'iPhone 15 Pro',
    'bluetooth-pairing-mode': false,
    'audio-immersive-sound': 58,
    'audio-bass': 2,
    'audio-mid': 0,
    'audio-treble': 1,
    'audio-speed-volume': true,
    'audio-quality': 'HIGH',
    'upgrades-autopilot': true,
    'upgrades-acceleration-boost': false,
    'upgrades-premium-connectivity': true,
    'upgrades-rear-heated-seats': true
  }
};

const INITIAL_QUICK_TOGGLES: Record<string, boolean> = {
  'Front Defrost': false,
  'Rear Defrost': false,
  'Heated Seat': true,
  'Heated Steering': true,
  Wipers: false
};

const QUICK_TOGGLE_ICONS: Record<string, LucideIcon> = {
  'Front Defrost': Wind,
  'Rear Defrost': WindArrowDown,
  'Heated Seat': Armchair,
  'Heated Steering': Disc3,
  Wipers: Droplets
};

const SAMPLE_MAP_STREETS: SampleStreet[] = [
  { id: 'w_washington', x: 4, y: 27, length: 94, angle: -25, level: 'major' },
  { id: 'venice', x: 1, y: 43, length: 80, angle: -32, level: 'major' },
  { id: 'national', x: 8, y: 55, length: 72, angle: -21, level: 'major' },
  { id: 'adams', x: 55, y: 19, length: 43, angle: -23, level: 'minor' },
  { id: 'santa_monica', x: 28, y: 16, length: 66, angle: 40, level: 'minor' },
  { id: 'regent', x: 20, y: 19, length: 44, angle: 64, level: 'minor' },
  { id: 'helms', x: 33, y: 42, length: 47, angle: 66, level: 'minor' },
  { id: 'wesley', x: 21, y: 45, length: 39, angle: 67, level: 'minor' },
  { id: 'cattaragus', x: 42, y: 20, length: 36, angle: 68, level: 'minor' },
  { id: 'la_cienega', x: 74, y: 22, length: 67, angle: 80, level: 'major' },
  { id: 'robertson', x: 56, y: 24, length: 56, angle: 79, level: 'minor' },
  { id: 'west_blvd', x: 66, y: 34, length: 50, angle: 80, level: 'local' },
  { id: 'higuera', x: 15, y: 65, length: 58, angle: -16, level: 'local' },
  { id: 'warner', x: 35, y: 62, length: 49, angle: -14, level: 'local' }
];

const SAMPLE_MAP_LABELS: SampleStreetLabel[] = [
  { id: 'label_washington', text: 'Washington Blvd', x: 44, y: 29, angle: -24, tone: 'major' },
  { id: 'label_venice', text: 'Venice Blvd', x: 30, y: 43, angle: -32, tone: 'major' },
  { id: 'label_national', text: 'National Blvd', x: 39, y: 56, angle: -21, tone: 'major' },
  { id: 'label_adams', text: 'Adams Blvd', x: 70, y: 20, angle: -22, tone: 'minor' },
  { id: 'label_regent', text: 'Regent St', x: 23, y: 28, angle: 64, tone: 'minor' },
  { id: 'label_helms', text: 'Helms Ave', x: 35, y: 49, angle: 66, tone: 'minor' },
  { id: 'label_wesley', text: 'Wesley St', x: 23, y: 50, angle: 67, tone: 'minor' },
  { id: 'label_robertson', text: 'Robertson Ave', x: 57, y: 36, angle: 79, tone: 'minor' },
  { id: 'label_lacienega', text: 'La Cienega Blvd', x: 75, y: 37, angle: 80, tone: 'major' },
  { id: 'label_higuera', text: 'Higuera St', x: 26, y: 67, angle: -15, tone: 'minor' },
  { id: 'label_warner', text: 'Warner Dr', x: 47, y: 64, angle: -14, tone: 'minor' }
];

const SAMPLE_MAP_POIS: SamplePoi[] = [
  { id: 'poi_park_a', x: 62, y: 38, type: 'park' },
  { id: 'poi_food', x: 73, y: 54, type: 'food' },
  { id: 'poi_charge', x: 68, y: 63, type: 'charge' },
  { id: 'poi_pin_a', x: 58, y: 44, type: 'pin' },
  { id: 'poi_pin_b', x: 49, y: 35, type: 'pin' }
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function App() {
  const [rightPaneMode, setRightPaneMode] = useState<RightPaneMode>('MAP');
  const [overlay, setOverlay] = useState<OverlayState>({
    isLauncherOpen: false,
    isKeyboardOpen: false
  });
  const [navigationState, setNavigationState] =
    useState<NavigationState>(INITIAL_NAVIGATION);
  const [mediaState, setMediaState] = useState<MediaState>(INITIAL_MEDIA);
  const [settingsState, setSettingsState] = useState<SettingsState>(INITIAL_SETTINGS);
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>({
    lightsOn: true,
    fogOn: true,
    autoHighBeamOn: false,
    seatbeltWarning: true,
    locked: true,
    frunkOpen: false,
    trunkOpen: false
  });
  const [quickToggles, setQuickToggles] =
    useState<Record<string, boolean>>(INITIAL_QUICK_TOGGLES);
  const [selectedAppName, setSelectedAppName] = useState('Spotify');
  const [searchDraft, setSearchDraft] = useState('');
  const [climateState, setClimateState] = useState<ClimateState>({
    driverTemp: 72,
    passengerTemp: 72
  });
  const [audioState, setAudioState] = useState<AudioState>({
    volumeLevel: 60,
    previousVolumeLevel: 60
  });
  const [activeDockShortcut, setActiveDockShortcut] = useState('NAV');
  const [mapViewport, setMapViewport] = useState<MapViewport>({
    zoom: 1,
    panX: 0,
    panY: 0
  });
  const [driveState, setDriveState] = useState<DriveState>({
    gear: 'P',
    speed: 0,
    speedLimit: 80,
    charging: false,
    batteryPercent: 55,
    cyberMode: false
  });
  const [leftPaneWidthPct, setLeftPaneWidthPct] = useState(33.5);
  const mainSplitPaneRef = useRef<HTMLElement | null>(null);
  const paneResizeRef = useRef<{ startX: number; widthPct: number } | null>(null);
  const cKeyDownAtRef = useRef<number | null>(null);

  const isOverlayBlocking = overlay.isLauncherOpen || overlay.isKeyboardOpen;
  const isImmersiveLeftPane = leftPaneWidthPct >= 96;

  useEffect(() => {
    if (!mediaState.isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setMediaState((prev) => {
        const next = prev.progress + 1;
        return {
          ...prev,
          progress: next >= prev.duration ? 0 : next
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mediaState.isPlaying]);

  const mediaProgress = useMemo(() => {
    if (mediaState.duration === 0) {
      return 0;
    }
    return Math.min(100, (mediaState.progress / mediaState.duration) * 100);
  }, [mediaState.duration, mediaState.progress]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === 'c') {
        if (!event.repeat) {
          cKeyDownAtRef.current = Date.now();
          setDriveState((prev) => ({
            ...prev,
            charging: !prev.charging,
            gear: !prev.charging ? 'P' : prev.gear,
            speed: !prev.charging ? 0 : prev.speed
          }));
        }
        return;
      }

      if (key === 'd' && !event.repeat) {
        setDriveState((prev) => ({ ...prev, gear: 'D', charging: false }));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setDriveState((prev) =>
          prev.gear !== 'D'
            ? prev
            : { ...prev, speed: clamp(prev.speed + 2, 0, prev.speedLimit + 20) }
        );
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setDriveState((prev) => ({ ...prev, speed: clamp(prev.speed - 3, 0, prev.speedLimit + 20) }));
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'c' && cKeyDownAtRef.current) {
        const heldDuration = Date.now() - cKeyDownAtRef.current;
        if (heldDuration >= 700) {
          setDriveState((prev) => ({ ...prev, cyberMode: !prev.cyberMode }));
        }
        cKeyDownAtRef.current = null;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDriveState((prev) => {
        if (prev.charging) {
          return {
            ...prev,
            batteryPercent: clamp(prev.batteryPercent + 1, 0, 100)
          };
        }
        if (prev.gear === 'D' && prev.speed > 0) {
          return {
            ...prev,
            batteryPercent: clamp(prev.batteryPercent - 1, 0, 100)
          };
        }
        return prev;
      });
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (rightPaneMode !== 'SETTINGS') {
      return;
    }
    setMediaState((prev) =>
      prev.isExpanded
        ? {
            ...prev,
            isExpanded: false
          }
        : prev
    );
  }, [rightPaneMode]);

  const openLauncher = () => {
    setOverlay({ isLauncherOpen: true, isKeyboardOpen: false });
  };

  const closeOverlays = () => {
    setOverlay({ isLauncherOpen: false, isKeyboardOpen: false });
    setActiveDockShortcut((prev) => {
      if (prev !== 'APPS') {
        return prev;
      }
      if (rightPaneMode === 'SETTINGS') {
        return 'CAR';
      }
      if (rightPaneMode === 'MAP') {
        return 'NAV';
      }
      return prev;
    });
  };

  const openKeyboard = () => {
    setRightPaneMode('MAP');
    setActiveDockShortcut('NAV');
    setOverlay({ isLauncherOpen: false, isKeyboardOpen: true });
    setSearchDraft(navigationState.query);
  };

  const startNavigation = (destination: string) => {
    const normalized = destination.trim();
    if (!normalized) {
      return;
    }

    setNavigationState((prev) => ({
      ...prev,
      active: true,
      query: normalized,
      destination: normalized,
      eta: '10:56 AM',
      distance: '8.4 mi',
      batteryAtArrival: '72%'
    }));
    setRightPaneMode('MAP');
    setActiveDockShortcut('NAV');
  };

  const handleSearchSubmit = (value: string) => {
    if (!value.trim()) {
      closeOverlays();
      return;
    }

    startNavigation(value);
    closeOverlays();
  };

  const updateSettingValue = (id: string, value: SettingValue) => {
    setSettingsState((prev) => {
      const nextValues: Record<string, SettingValue> = {
        ...prev.values,
        [id]: value
      };

      if (id === 'autopilot-autosteer-beta' && !Boolean(value)) {
        nextValues['autopilot-navigate-on-autopilot'] = false;
        nextValues['autopilot-auto-lane-change'] = false;
        nextValues['autopilot-traffic-light-stop'] = false;
        nextValues['autopilot-summon-standby'] = false;
        nextValues['autopilot-fsd-profile'] = 'CHILL';
      }

      if (id === 'autopilot-navigate-on-autopilot' && !Boolean(value)) {
        nextValues['autopilot-auto-lane-change'] = false;
      }

      if (id === 'controls-headlights' && String(value) !== 'AUTO') {
        nextValues['controls-auto-high-beam'] = false;
      }

      if (id === 'lights-headlights' && String(value) !== 'AUTO') {
        nextValues['lights-auto-high-beam'] = false;
      }

      if (id === 'controls-headlights') {
        nextValues['lights-headlights'] = value;
      }

      if (id === 'lights-headlights') {
        nextValues['controls-headlights'] = value;
      }

      if (id === 'controls-auto-high-beam') {
        nextValues['lights-auto-high-beam'] = value;
      }

      if (id === 'lights-auto-high-beam') {
        nextValues['controls-auto-high-beam'] = value;
      }

      if (id === 'controls-child-lock') {
        nextValues['locks-child-lock'] = value;
      }

      if (id === 'locks-child-lock') {
        nextValues['controls-child-lock'] = value;
      }

      if (id === 'controls-sentry-mode') {
        nextValues['safety-sentry-mode'] = value;
      }

      if (id === 'safety-sentry-mode') {
        nextValues['controls-sentry-mode'] = value;
      }

      if (id === 'charging-charge-limit') {
        nextValues['charging-trip-planner-precondition'] = Number(value) >= 80;
      }

      if (id === 'controls-wipers-mode' && String(value) === 'OFF') {
        nextValues['controls-dashcam-auto-save'] = false;
      }

      return {
        ...prev,
        values: nextValues
      };
    });

    if (id === 'controls-headlights' || id === 'lights-headlights') {
      setVehicleStatus((prev) => ({
        ...prev,
        lightsOn: String(value) !== 'OFF'
      }));
    }

    if (id === 'controls-auto-high-beam' || id === 'lights-auto-high-beam') {
      setVehicleStatus((prev) => ({
        ...prev,
        autoHighBeamOn: Boolean(value)
      }));
    }

    if (id === 'lights-fog-lights') {
      setVehicleStatus((prev) => ({
        ...prev,
        fogOn: Boolean(value)
      }));
    }

    if (id === 'locks-walk-away') {
      setVehicleStatus((prev) => ({
        ...prev,
        locked: Boolean(value)
      }));
    }
  };

  const toggleQuickAction = (label: string) => {
    setQuickToggles((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleLauncherAppClick = (app: AppTile) => {
    if (app.id === 'settings') {
      setRightPaneMode('SETTINGS');
      setActiveDockShortcut('CAR');
      setMediaState((prev) => ({ ...prev, isExpanded: false }));
    } else {
      setSelectedAppName(app.label);
      setRightPaneMode('APP');
    }
    closeOverlays();
  };

  const endTrip = () => {
    setNavigationState((prev) => ({
      ...prev,
      active: false
    }));
  };

  const toggleCharging = () => {
    setDriveState((prev) => ({
      ...prev,
      charging: !prev.charging,
      gear: !prev.charging ? 'P' : prev.gear,
      speed: !prev.charging ? 0 : prev.speed
    }));
  };

  const beginPaneResize = (event: PointerEvent<HTMLDivElement>) => {
    paneResizeRef.current = { startX: event.clientX, widthPct: leftPaneWidthPct };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePaneResize = (event: PointerEvent<HTMLDivElement>) => {
    if (!paneResizeRef.current || !mainSplitPaneRef.current) {
      return;
    }
    const paneWidth = mainSplitPaneRef.current.getBoundingClientRect().width;
    if (paneWidth <= 0) {
      return;
    }
    const deltaPct = ((event.clientX - paneResizeRef.current.startX) / paneWidth) * 100;
    setLeftPaneWidthPct(clamp(paneResizeRef.current.widthPct + deltaPct, 27, 100));
  };

  const endPaneResize = () => {
    paneResizeRef.current = null;
  };

  const changeHvacTemp = (zone: 'driverTemp' | 'passengerTemp', diff: number) => {
    setClimateState((prev) => ({
      ...prev,
      [zone]: clamp(prev[zone] + diff, 60, 82)
    }));
  };

  const changeVolumeLevel = (diff: number) => {
    setAudioState((prev) => ({
      ...prev,
      previousVolumeLevel: prev.volumeLevel,
      volumeLevel: clamp(prev.volumeLevel + diff, 0, 100)
    }));
  };

  const toggleMute = () => {
    setAudioState((prev) => {
      if (prev.volumeLevel !== 0) {
        return {
          volumeLevel: 0,
          previousVolumeLevel: prev.volumeLevel
        };
      }

      return {
        volumeLevel: prev.previousVolumeLevel === 0 ? 60 : prev.previousVolumeLevel,
        previousVolumeLevel: prev.previousVolumeLevel === 0 ? 60 : prev.previousVolumeLevel
      };
    });
  };

  const handleOpenDockApp = (label: string) => {
    closeOverlays();
    if (label === 'CAR') {
      setRightPaneMode('SETTINGS');
      setActiveDockShortcut('CAR');
      setMediaState((prev) => ({ ...prev, isExpanded: false }));
      return;
    }

    if (label === 'NAV') {
      setRightPaneMode('MAP');
      setActiveDockShortcut('NAV');
      return;
    }

    if (label === 'APPS') {
      openLauncher();
      setActiveDockShortcut('APPS');
      return;
    }

    if (label === 'PHONE') {
      setSelectedAppName('Phone');
    } else if (label === 'CAL') {
      setSelectedAppName('Calendar');
    } else if (label === 'BT') {
      setSelectedAppName('Bluetooth');
    } else if (label === 'SPOTIFY') {
      setSelectedAppName('Spotify');
    } else if (label === 'TOYBOX') {
      setSelectedAppName('Toybox');
    } else if (label === 'ARCADE') {
      setSelectedAppName('Arcade');
    } else {
      setSelectedAppName(label);
    }
    setRightPaneMode('APP');
    setActiveDockShortcut(label);
  };

  return (
      <div
      className={`dashboard-shell dark-mode ${driveState.cyberMode ? 'cyber-mode' : ''} ${isImmersiveLeftPane ? 'immersive-left-pane' : ''} ${rightPaneMode === 'SETTINGS' ? 'settings-open' : ''}`}
      style={{ '--left-pane-width': `${leftPaneWidthPct}%` } as CSSProperties}
    >
      <TopStatusBar
        vehicleStatus={vehicleStatus}
        driveState={driveState}
        onToggleLock={() =>
          setVehicleStatus((prev) => ({ ...prev, locked: !prev.locked }))
        }
        onToggleCharging={toggleCharging}
        onSetDrive={() => {
          setDriveState((prev) => ({ ...prev, gear: 'D', charging: false }));
        }}
      />

      <main
        ref={mainSplitPaneRef}
        className="main-split-pane"
        style={{ gridTemplateColumns: isImmersiveLeftPane ? '1fr 0px' : `${leftPaneWidthPct}% 1fr` }}
      >
        <LeftPane
          isImmersive={isImmersiveLeftPane}
          rightPaneMode={rightPaneMode}
          navigationActive={navigationState.active || driveState.gear === 'D'}
          currentSpeed={driveState.speed}
          speedLimit={driveState.speedLimit}
          driveState={driveState}
          mediaState={mediaState}
          mediaProgress={mediaProgress}
          onMediaTogglePlay={() =>
            setMediaState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
          }
          onMediaPrev={() =>
            setMediaState((prev) => ({
              ...prev,
              track: 'Midnight Highway',
              artist: 'Nova Drift',
              progress: 0,
              duration: 201,
              isPlaying: true
            }))
          }
          onMediaNext={() =>
            setMediaState((prev) => ({
              ...prev,
              track: 'Northern Lights',
              artist: 'Circuit Bloom',
              progress: 0,
              duration: 244,
              isPlaying: true
            }))
          }
          onMediaFavorite={() =>
            setMediaState((prev) => ({ ...prev, isFavorite: !prev.isFavorite }))
          }
          onMediaExpand={() =>
            setMediaState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }))
          }
          onMediaSeek={(nextValue) =>
            setMediaState((prev) => ({ ...prev, progress: nextValue }))
          }
          vehicleStatus={vehicleStatus}
          onToggleLock={() =>
            setVehicleStatus((prev) => ({ ...prev, locked: !prev.locked }))
          }
          onToggleFrunk={() =>
            setVehicleStatus((prev) => ({ ...prev, frunkOpen: !prev.frunkOpen }))
          }
          onToggleTrunk={() =>
            setVehicleStatus((prev) => ({ ...prev, trunkOpen: !prev.trunkOpen }))
          }
          searchValue={navigationState.query}
          onSearchClick={openKeyboard}
          onQuickDestination={startNavigation}
        />

        {!isImmersiveLeftPane && (
          <RightPane
            mode={rightPaneMode}
            navigationState={navigationState}
            searchValue={navigationState.query}
            settingsState={settingsState}
            selectedAppName={selectedAppName}
            mapViewport={mapViewport}
            onSearchClick={openKeyboard}
            onEndTrip={endTrip}
            onActivateMap={() => {
              setRightPaneMode('MAP');
              setActiveDockShortcut('NAV');
            }}
            onMapViewportChange={setMapViewport}
            onQuickDestination={startNavigation}
            onSettingsCategoryChange={(category) =>
              setSettingsState((prev) => ({ ...prev, activeCategory: category }))
            }
            onSettingChange={updateSettingValue}
          />
        )}
      </main>

      <div
        className="split-resizer"
        style={{ left: `calc(${isImmersiveLeftPane ? 100 : leftPaneWidthPct}% - 3px)` }}
        onPointerDown={beginPaneResize}
        onPointerMove={movePaneResize}
        onPointerUp={endPaneResize}
        onPointerCancel={endPaneResize}
      />

      <BottomDock
        disabled={isOverlayBlocking}
        activeShortcut={overlay.isLauncherOpen ? 'APPS' : activeDockShortcut}
        climateState={climateState}
        audioState={audioState}
        onOpenApp={handleOpenDockApp}
        onDriverTempChange={(diff) => changeHvacTemp('driverTemp', diff)}
        onVolumeChange={changeVolumeLevel}
        onToggleMute={toggleMute}
      />

      <OverlayLayer
        overlay={overlay}
        searchDraft={searchDraft}
        quickToggles={quickToggles}
        onCloseAll={closeOverlays}
        onSearchDraftChange={setSearchDraft}
        onSearchSubmit={handleSearchSubmit}
        onSearchMic={() => {
          setSearchDraft('Voice destination draft');
        }}
        onQuickToggle={toggleQuickAction}
        onSelectApp={handleLauncherAppClick}
      />
    </div>
  );
}

interface TopStatusBarProps {
  vehicleStatus: VehicleStatus;
  driveState: DriveState;
  onToggleLock: () => void;
  onToggleCharging: () => void;
  onSetDrive: () => void;
}

function TopStatusBar({
  vehicleStatus,
  driveState,
  onToggleLock,
  onToggleCharging,
  onSetDrive
}: TopStatusBarProps) {
  const gearLabels: Array<DriveState['gear']> = ['P', 'R', 'N', 'D'];

  return (
    <header className="top-status-bar">
      <div className="top-status-left-pane">
        <div className="gear-indicator">
          {gearLabels.map((gear) => (
            <button
              key={gear}
              className={gear === driveState.gear ? 'gear-chip active' : 'gear-chip'}
              disabled={gear !== 'D'}
              onClick={gear === 'D' ? onSetDrive : undefined}
            >
              {gear}
            </button>
          ))}
        </div>
        <span className="status-separator" />
        <button className="battery-indicator status-clickable" onClick={onToggleCharging}>
          <span className="battery-shell">
            <span
              className="battery-fill"
              style={{ width: `${clamp(driveState.batteryPercent, 0, 100)}%` }}
            />
          </span>
          <span>{driveState.batteryPercent}%</span>
        </button>
      </div>

      <div className="top-status-right-pane">
        <div className="top-status-center">
          <button className="status-icon-button status-clickable" onClick={onToggleLock}>
            {vehicleStatus.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <span className="status-chip with-icon">
            <User size={14} />
            Easy Entry
          </span>
          {driveState.charging && (
            <span className="status-chip charging">
              <BatteryCharging size={14} />
              Charging
            </span>
          )}
        </div>
        <div className="top-status-right-group">
          <span className="status-chip">
            <ClockDisplay />
          </span>
          <span className="status-chip">72 F</span>
          <div className="top-status-right">
            <TriangleAlert size={12} />
            <div>
              <span>PASSENGER</span>
              <span>AIRBAG OFF</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function ClockDisplay() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span>
      {now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}
    </span>
  );
}

interface BottomDockProps {
  disabled: boolean;
  activeShortcut: string;
  climateState: ClimateState;
  audioState: AudioState;
  onOpenApp: (name: string) => void;
  onDriverTempChange: (diff: number) => void;
  onVolumeChange: (diff: number) => void;
  onToggleMute: () => void;
}

function DockCarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 123 92" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M21.5203 82.1604C21.355 82.1604 21.1962 82.2254 21.0784 82.3414C20.9605 82.4574 20.893 82.615 20.8903 82.7804C20.8437 85.6337 20.2003 88.3371 18.9603 90.8904C18.888 91.0373 18.7753 91.1605 18.6353 91.2456C18.4954 91.3306 18.334 91.3739 18.1703 91.3704C14.997 91.2971 10.9403 91.2971 6.00033 91.3704C3.36033 91.4104 1.89699 90.1337 1.61033 87.5404C0.290326 75.6204 0.580327 62.3804 0.810327 51.8604C1.01033 43.3304 5.03033 39.4804 10.9503 34.5404C11.0782 34.4362 11.1721 34.2962 11.2201 34.1383C11.268 33.9804 11.2678 33.8119 11.2196 33.6541C11.1713 33.4963 11.077 33.3566 10.9489 33.2526C10.8208 33.1486 10.6646 33.0852 10.5003 33.0704L1.95033 32.2004C1.41803 32.1484 0.923948 31.9008 0.563722 31.5055C0.203496 31.1101 0.00274457 30.5952 0.000325553 30.0604C-0.0496744 24.0204 5.67033 24.1404 9.86033 23.2704C10.0932 23.2206 10.3362 23.2611 10.5404 23.3836C10.7446 23.5061 10.8947 23.7015 10.9603 23.9304L12.4303 28.9904C12.5012 29.2463 12.657 29.4706 12.8722 29.6262C13.0873 29.7819 13.349 29.8597 13.6143 29.8469C13.8796 29.8341 14.1326 29.7314 14.3318 29.5558C14.5309 29.3802 14.6644 29.142 14.7103 28.8804C15.657 23.8937 17.307 18.5771 19.6603 12.9304C22.4537 6.22373 27.7737 2.43373 35.6203 1.5604C42.9603 0.7404 49.6437 0.243736 55.6703 0.0704026C63.6437 -0.162931 72.6837 0.183733 82.7903 1.1104C88.997 1.68373 93.4237 2.74373 96.0703 4.2904C99.7637 6.4504 102.417 10.0504 104.03 15.0904C106.177 21.8104 107.52 26.0504 108.06 27.8104C108.354 28.7837 108.914 29.5971 109.74 30.2504C109.867 30.3494 110.017 30.4129 110.176 30.4342C110.335 30.4555 110.497 30.434 110.645 30.3718C110.793 30.3096 110.921 30.209 111.017 30.0804C111.113 29.9518 111.173 29.7999 111.19 29.6404L111.73 24.2704C111.744 24.1447 111.783 24.023 111.844 23.9126C111.906 23.8022 111.989 23.7054 112.089 23.6279C112.189 23.5504 112.303 23.4938 112.425 23.4616C112.548 23.4294 112.675 23.4222 112.8 23.4404L119.46 24.4204C119.817 24.4723 120.144 24.6414 120.39 24.9004C121.797 26.3937 122.597 28.1604 122.79 30.2004C122.821 30.5236 122.737 30.8475 122.552 31.116C122.368 31.3845 122.095 31.5806 121.78 31.6704C118.547 32.6237 115.417 33.0371 112.39 32.9104C112.178 32.9017 111.969 32.964 111.796 33.0876C111.624 33.2113 111.497 33.3893 111.437 33.5938C111.376 33.7983 111.385 34.0178 111.462 34.2181C111.538 34.4183 111.678 34.5879 111.86 34.7004C114.26 36.1337 116.447 38.0471 118.42 40.4404C121.99 44.7604 122.07 50.6004 122.05 56.3304C122.017 69.7904 121.957 77.9571 121.87 80.8304C121.777 83.9837 121.38 86.8904 120.68 89.5504C120.563 89.9927 120.311 90.3866 119.959 90.6758C119.607 90.965 119.173 91.1346 118.72 91.1604C114.427 91.3937 109.96 91.3871 105.32 91.1404C104.1 91.0737 103.33 90.3037 103.01 88.8304C102.484 86.3904 102.15 84.3904 102.01 82.8304C101.993 82.6467 101.908 82.4761 101.773 82.3521C101.638 82.2282 101.462 82.1598 101.28 82.1604H21.5203ZM61.4603 6.7104C52.867 6.71707 44.7303 7.0804 37.0503 7.8004C33.5303 8.13374 31.107 8.76707 29.7803 9.7004C27.6937 11.1737 26.1737 13.1737 25.2203 15.7004C23.427 20.4271 21.8937 25.1137 20.6203 29.7604C20.584 29.8977 20.583 30.0421 20.6176 30.1799C20.6522 30.3177 20.7212 30.4444 20.8181 30.5483C20.915 30.6522 21.0366 30.7298 21.1717 30.7739C21.3068 30.818 21.4508 30.8271 21.5903 30.8004C23.037 30.5337 24.6137 30.3371 26.3203 30.2104C35.2603 29.5571 46.977 29.2237 61.4703 29.2104C75.9703 29.1971 87.687 29.5137 96.6203 30.1604C98.3337 30.2804 99.9137 30.4737 101.36 30.7404C101.5 30.7671 101.644 30.758 101.779 30.7139C101.914 30.6698 102.036 30.5922 102.133 30.4883C102.229 30.3844 102.298 30.2577 102.333 30.1199C102.368 29.9821 102.367 29.8377 102.33 29.7004C101.05 25.0537 99.507 20.3671 97.7003 15.6404C96.747 13.1137 95.2237 11.1171 93.1303 9.6504C91.8037 8.71707 89.3803 8.08707 85.8603 7.7604C78.1803 7.05373 70.047 6.70374 61.4603 6.7104ZM90.5503 54.9904C90.5327 55.0672 90.5335 55.147 90.5526 55.2235C90.5717 55.2999 90.6086 55.3707 90.6602 55.4302C90.7119 55.4896 90.7769 55.536 90.8499 55.5656C90.9229 55.5952 91.0018 55.6071 91.0803 55.6004C98.6137 55.0671 105.944 54.0604 113.07 52.5804C113.726 52.4437 114.32 52.1025 114.768 51.6062C115.216 51.1099 115.493 50.4844 115.56 49.8204L115.93 46.1604C115.959 45.8871 115.921 45.6109 115.821 45.3551C115.72 45.0993 115.56 44.8713 115.353 44.6902C115.147 44.509 114.9 44.38 114.633 44.3139C114.366 44.2478 114.088 44.2466 113.82 44.3104C108.607 45.5437 103.064 47.2671 97.1903 49.4804C95.0803 50.2804 91.1103 52.4204 90.5503 54.9904ZM32.5203 54.8904C31.9403 52.3204 27.9303 50.2004 25.8103 49.4204C19.897 47.2471 14.3203 45.5671 9.08033 44.3804C8.81218 44.3201 8.53351 44.3245 8.26742 44.3934C8.00133 44.4622 7.75548 44.5935 7.55021 44.7762C7.34495 44.959 7.18619 45.1881 7.08709 45.4444C6.98798 45.7008 6.95139 45.9771 6.98033 46.2504L7.38032 49.9204C7.45266 50.5862 7.73596 51.2118 8.18911 51.7063C8.64225 52.2008 9.24166 52.5385 9.90033 52.6704C17.067 54.0904 24.4303 55.0371 31.9903 55.5104C32.0704 55.5155 32.1507 55.502 32.2245 55.471C32.2984 55.44 32.3638 55.3923 32.4155 55.3319C32.4671 55.2715 32.5036 55.2 32.5218 55.1233C32.54 55.0466 32.5395 54.9668 32.5203 54.8904Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BottomDock({
  disabled,
  activeShortcut,
  climateState,
  audioState,
  onOpenApp,
  onDriverTempChange,
  onVolumeChange,
  onToggleMute
}: BottomDockProps) {
  const shortcuts: Array<{
    id: string;
    shortLabel: string;
    className?: string;
    iconSrc?: string;
    icon?: LucideIcon;
  }> = [
    { id: 'NAV', shortLabel: 'NAV', className: 'dock-shortcut-nav', iconSrc: navIcon },
    { id: 'PHONE', shortLabel: 'Phone', className: 'dock-shortcut-phone', icon: Phone },
    { id: 'CAL', shortLabel: 'Calendar', className: 'dock-shortcut-calendar', iconSrc: calendarIcon },
    { id: 'BT', shortLabel: 'Bluetooth', className: 'dock-shortcut-bt', icon: Bluetooth },
    { id: 'SPOTIFY', shortLabel: 'Spotify', className: 'dock-shortcut-spotify', iconSrc: spotifyIcon },
    { id: 'TOYBOX', shortLabel: 'Toybox', className: 'dock-shortcut-toybox', icon: Gift },
    { id: 'APPS', shortLabel: 'Apps', className: 'dock-shortcut-apps', icon: MoreHorizontal },
    { id: 'ARCADE', shortLabel: 'Arcade', className: 'dock-shortcut-arcade', icon: Gamepad2 }
  ];
  const isMuted = audioState.volumeLevel === 0;

  return (
    <footer className={`bottom-dock ${disabled ? 'dock-disabled' : ''}`}>
      <button
        className={activeShortcut === 'CAR' ? 'dock-main-icon active' : 'dock-main-icon'}
        onClick={() => onOpenApp('CAR')}
        disabled={disabled}
      >
        <DockCarGlyph className="dock-icon-image dock-icon-svg" />
      </button>

      <div className="dock-temp-control">
        <button className="dock-chevron" onClick={() => onDriverTempChange(-1)} disabled={disabled}>
          <ChevronLeft size={25} strokeWidth={2.1} />
        </button>
        <span className="dock-temp-value">{climateState.driverTemp}</span>
        <button className="dock-chevron" onClick={() => onDriverTempChange(1)} disabled={disabled}>
          <ChevronRight size={25} strokeWidth={2.1} />
        </button>
      </div>

      <div className="dock-app-shortcuts">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.id}
            className={
              activeShortcut === shortcut.id
                ? `dock-shortcut active ${shortcut.className ?? ''}`
                : `dock-shortcut ${shortcut.className ?? ''}`
            }
            onClick={() => onOpenApp(shortcut.id)}
            disabled={disabled}
            title={shortcut.id}
          >
            {shortcut.iconSrc ? <img src={shortcut.iconSrc} alt={shortcut.id} className="dock-shortcut-icon" /> : null}
            {!shortcut.iconSrc && shortcut.icon ? (
              <shortcut.icon className="dock-shortcut-icon-svg" size={18} />
            ) : null}
            {!shortcut.iconSrc && !shortcut.icon ? shortcut.shortLabel : null}
            {activeShortcut === shortcut.id ? <span className="dock-shortcut-indicator" /> : null}
          </button>
        ))}
      </div>

      <div className="dock-volume-control">
        <button className="dock-chevron" onClick={() => onVolumeChange(-30)} disabled={disabled}>
          <ChevronLeft size={25} strokeWidth={2.1} />
        </button>
        <button className="dock-volume-center" onClick={onToggleMute} disabled={disabled}>
          {isMuted ? <VolumeX size={29} className="dock-icon-svg" /> : <Volume2 size={29} className="dock-icon-svg" />}
        </button>
        <button className="dock-chevron" onClick={() => onVolumeChange(30)} disabled={disabled}>
          <ChevronRight size={25} strokeWidth={2.1} />
        </button>
      </div>
    </footer>
  );
}

interface LeftPaneProps {
  isImmersive: boolean;
  rightPaneMode: RightPaneMode;
  navigationActive: boolean;
  currentSpeed: number;
  speedLimit: number;
  driveState: DriveState;
  mediaState: MediaState;
  mediaProgress: number;
  onMediaTogglePlay: () => void;
  onMediaPrev: () => void;
  onMediaNext: () => void;
  onMediaFavorite: () => void;
  onMediaExpand: () => void;
  onMediaSeek: (value: number) => void;
  vehicleStatus: VehicleStatus;
  onToggleLock: () => void;
  onToggleFrunk: () => void;
  onToggleTrunk: () => void;
  searchValue: string;
  onSearchClick: () => void;
  onQuickDestination: (destination: string) => void;
}

function LeftPane({
  isImmersive,
  rightPaneMode,
  navigationActive,
  currentSpeed,
  speedLimit,
  driveState,
  mediaState,
  mediaProgress,
  onMediaTogglePlay,
  onMediaPrev,
  onMediaNext,
  onMediaFavorite,
  onMediaExpand,
  onMediaSeek,
  vehicleStatus,
  onToggleLock,
  onToggleFrunk,
  onToggleTrunk,
  searchValue,
  onSearchClick,
  onQuickDestination
}: LeftPaneProps) {
  const statusItems: Array<{ label: string; icon: LucideIcon; tone: string }> = [
    {
      label: 'Lights',
      icon: Lightbulb,
      tone: vehicleStatus.lightsOn ? 'on' : 'off'
    },
    {
      label: 'Auto High',
      icon: Gauge,
      tone: vehicleStatus.autoHighBeamOn ? 'on' : 'muted'
    },
    {
      label: 'Fog',
      icon: CloudFog,
      tone: vehicleStatus.fogOn ? 'on' : 'off'
    },
    {
      label: 'Seatbelt',
      icon: TriangleAlert,
      tone: vehicleStatus.seatbeltWarning ? 'warn' : 'off'
    }
  ];
  const isSettingsMode = rightPaneMode === 'SETTINGS';

  return (
    <section className={isImmersive ? 'left-pane immersive' : 'left-pane'}>
      <div className="left-pane-content">
        {!isImmersive && (
          <div className="vehicle-status-icon-stack">
            {statusItems.map((item) => {
              const StatusIcon = item.icon;
              return (
                <StatusIcon
                  key={item.label}
                  className={`status-pill status-${item.tone}`}
                  aria-label={item.label}
                  size={20}
                  strokeWidth={1.8}
                />
              );
            })}
          </div>
        )}

        <DrivingVisualization
          isImmersive={isImmersive}
          driveState={driveState}
          vehicleStatus={vehicleStatus}
          onToggleLock={onToggleLock}
          onToggleFrunk={onToggleFrunk}
          onToggleTrunk={onToggleTrunk}
        />

        {!isImmersive && navigationActive && (
          <div className="speed-cluster">
            <div className="speed-value">{currentSpeed}</div>
            <div className="speed-limit">SPEED LIMIT {speedLimit}</div>
          </div>
        )}
      </div>

      <div className={isImmersive ? 'left-bottom-cards-area immersive' : 'left-bottom-cards-area'}>
        <div className={isImmersive ? 'immersive-bottom-cards' : undefined}>
          <MediaMiniPlayerCard
            isImmersive={isImmersive}
            resetKey={`${rightPaneMode}-${isImmersive ? 'immersive' : 'split'}`}
            lockAtBottom={isSettingsMode}
            mediaState={mediaState}
            mediaProgress={mediaProgress}
            onPrev={onMediaPrev}
            onTogglePlay={onMediaTogglePlay}
            onNext={onMediaNext}
            onToggleFavorite={onMediaFavorite}
            onToggleExpanded={onMediaExpand}
            onSeek={onMediaSeek}
          />
          {isImmersive && (
            <ImmersiveNavigationCard
              searchValue={searchValue}
              onSearchClick={onSearchClick}
              onQuickDestination={onQuickDestination}
            />
          )}
        </div>
      </div>
    </section>
  );
}

interface DrivingVisualizationProps {
  isImmersive: boolean;
  driveState: DriveState;
  vehicleStatus: VehicleStatus;
  onToggleLock: () => void;
  onToggleFrunk: () => void;
  onToggleTrunk: () => void;
}

function DrivingVisualization({
  isImmersive,
  driveState,
  vehicleStatus,
  onToggleLock,
  onToggleFrunk,
  onToggleTrunk
}: DrivingVisualizationProps) {
  const [vehicleYaw, setVehicleYaw] = useState(0);
  const dragRef = useRef<{ startX: number; initialYaw: number } | null>(null);
  const vehicleImageSrc = driveState.cyberMode ? cybercabImage : modelYRedImage;

  useEffect(() => {
    setVehicleYaw(0);
  }, [isImmersive, driveState.cyberMode]);

  const beginVehicleDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startX: event.clientX, initialYaw: vehicleYaw };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveVehicleDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return;
    }
    const delta = event.clientX - dragRef.current.startX;
    setVehicleYaw(clamp(dragRef.current.initialYaw + delta * 0.12, -24, 24));
  };

  const endVehicleDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      className={`driving-visualization vehicle-3d ${driveState.cyberMode ? 'cyber' : ''} ${isImmersive ? 'immersive' : ''}`}
      onPointerDown={beginVehicleDrag}
      onPointerMove={moveVehicleDrag}
      onPointerUp={endVehicleDrag}
      onPointerCancel={endVehicleDrag}
      onDoubleClick={() => setVehicleYaw(0)}
    >
      <div className="vehicle-hero-stage">
        <img
          key={`${driveState.cyberMode ? 'cyber' : 'modely'}-${isImmersive ? 'immersive' : 'split'}`}
          className="vehicle-hero-image"
          style={{ transform: `perspective(760px) rotateY(${vehicleYaw}deg)` }}
          src={vehicleImageSrc}
          alt={driveState.cyberMode ? 'Cybercab' : 'Vehicle'}
          draggable={false}
        />
      </div>
      <div className="vehicle-hotspots">
        <button className="vehicle-hotspot vehicle-hotspot-frunk" onClick={onToggleFrunk}>
          <span>{vehicleStatus.frunkOpen ? 'Close' : 'Open'}</span>
          <strong>Frunk</strong>
        </button>
        <button className="vehicle-hotspot vehicle-hotspot-lock" onClick={onToggleLock}>
          {vehicleStatus.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
        <button className="vehicle-hotspot vehicle-hotspot-trunk" onClick={onToggleTrunk}>
          <span>{vehicleStatus.trunkOpen ? 'Close' : 'Open'}</span>
          <strong>Trunk</strong>
        </button>
      </div>
    </div>
  );
}

interface MediaMiniPlayerProps {
  isImmersive: boolean;
  resetKey: string;
  lockAtBottom: boolean;
  mediaState: MediaState;
  mediaProgress: number;
  onPrev: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onToggleFavorite: () => void;
  onToggleExpanded: () => void;
  onSeek: (value: number) => void;
}

function MediaMiniPlayerCard({
  isImmersive,
  resetKey,
  lockAtBottom,
  mediaState,
  mediaProgress,
  onPrev,
  onTogglePlay,
  onNext,
  onToggleFavorite,
  onToggleExpanded,
  onSeek
}: MediaMiniPlayerProps) {
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragRef = useRef<{ startY: number } | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const swipeRef = useRef<{
    startX: number;
    startY: number;
    mode: 'pending' | 'swipe' | null;
  } | null>(null);

  useEffect(() => {
    setDragOffsetY(0);
  }, [resetKey]);

  useEffect(() => {
    if (lockAtBottom) {
      setDragOffsetY(0);
    }
  }, [lockAtBottom]);

  const canExpand = !isImmersive && !lockAtBottom;

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (isImmersive || lockAtBottom) {
      return;
    }
    dragRef.current = { startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (isImmersive || lockAtBottom) {
      return;
    }
    if (!dragRef.current) {
      return;
    }
    setDragOffsetY(clamp(event.clientY - dragRef.current.startY, -90, 90));
  };

  const endDrag = () => {
    if (!canExpand) {
      return;
    }
    if (dragRef.current) {
      if (dragOffsetY < -45 && !mediaState.isExpanded) {
        onToggleExpanded();
      }
      if (dragOffsetY > 45 && mediaState.isExpanded) {
        onToggleExpanded();
      }
    }
    dragRef.current = null;
    setDragOffsetY(0);
  };

  const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button,input')) {
      return;
    }
    swipeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      mode: 'pending'
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (!swipeRef.current) {
      return;
    }
    const deltaX = event.clientX - swipeRef.current.startX;
    const deltaY = event.clientY - swipeRef.current.startY;

    if (swipeRef.current.mode === 'pending') {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        swipeRef.current.mode = 'swipe';
      } else if (Math.abs(deltaY) > 10) {
        swipeRef.current.mode = null;
        return;
      }
    }

    if (swipeRef.current.mode !== 'swipe') {
      return;
    }
    setSwipeOffsetX(clamp(deltaX, -240, 240));
  };

  const endSwipe = () => {
    if (swipeRef.current?.mode === 'swipe') {
      if (swipeOffsetX <= -80 && carouselIndex < 2) {
        setCarouselIndex((prev) => prev + 1);
      } else if (swipeOffsetX >= 80 && carouselIndex > 0) {
        setCarouselIndex((prev) => prev - 1);
      }
    }
    swipeRef.current = null;
    setSwipeOffsetX(0);
  };

  const showExpandedControls = canExpand && mediaState.isExpanded && carouselIndex === 0;

  return (
    <article
      className={`media-mini-player ${isImmersive ? 'immersive' : ''} ${showExpandedControls ? 'expanded' : 'collapsed'}`}
      style={{ transform: lockAtBottom ? undefined : `translateY(${dragOffsetY}px)` }}
    >
      {!isImmersive && (
        <div
          className="media-drag-handle"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      )}

      <div
        className="media-carousel-viewport"
        onPointerDown={startSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
      >
        <div
          className="media-carousel-track"
          style={{
            transform: `translateX(calc(${carouselIndex * -100}% + ${swipeOffsetX}px))`
          }}
        >
          <section className="media-slide">
            <div className="media-header">
              <div className="media-cover" />
              <div className="media-track-meta">
                <div className="media-track-meta-top">
                  <strong>{mediaState.track}</strong>
                  {isImmersive && (
                    <div className="media-meta-actions">
                      <button className="media-control icon subtle" aria-label="shuffle">
                        <Shuffle size={15} />
                      </button>
                      <button className="media-control icon subtle" aria-label="repeat">
                        <Repeat2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
                <p>
                  <span className="media-artist-pulse" />
                  {mediaState.artist}
                </p>
                <div className="media-progress" aria-label="media-progress-bar">
                  <div className="media-progress-fill" style={{ width: `${mediaProgress}%` }} />
                </div>
              </div>
              {!isImmersive && (
                <button className="media-favorite icon" onClick={onToggleFavorite} aria-label="favorite">
                  <Heart size={16} fill={mediaState.isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>

            {showExpandedControls && (
              <input
                className="media-seek"
                type="range"
                min={0}
                max={mediaState.duration}
                value={mediaState.progress}
                onChange={(event) => onSeek(Number(event.target.value))}
              />
            )}

            <div className="media-controls">
              <button className="media-control icon" onClick={onPrev} aria-label="previous">
                <SkipBack size={16} />
              </button>
              <button className="media-control icon" onClick={onTogglePlay} aria-label="play pause">
                {mediaState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button className="media-control icon" onClick={onNext} aria-label="next">
                <SkipForward size={16} />
              </button>
              <button className="media-control icon subtle" onClick={onToggleFavorite} aria-label="favorite">
                <Heart size={16} fill={mediaState.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                className="media-control icon subtle"
                onClick={canExpand ? onToggleExpanded : undefined}
                aria-label="equalizer"
                disabled={!canExpand}
              >
                <SlidersHorizontal size={16} />
              </button>
              <button
                className="media-control icon subtle"
                onClick={() => setCarouselIndex(1)}
                aria-label="open next panel"
              >
                <Search size={16} />
              </button>
            </div>
          </section>

          <section className="media-slide media-slide-stats">
            <div className="media-stats-grid">
              <div>
                <h4>Current Drive</h4>
                <p>
                  4.2 <span>mi</span>
                </p>
                <p>
                  7 <span>min</span>
                </p>
                <p>
                  249.2 <span>Wh/mi</span>
                </p>
              </div>
              <div>
                <h4>Since Charge</h4>
                <p>
                  38.8 <span>mi</span>
                </p>
                <p>
                  9.1 <span>kWh</span>
                </p>
                <p>
                  233.7 <span>Wh/mi</span>
                </p>
              </div>
              <div>
                <h4>Lifetime</h4>
                <p>
                  20,836 <span>mi</span>
                </p>
                <p>
                  4,788 <span>kWh</span>
                </p>
                <p>
                  229.5 <span>Wh/mi</span>
                </p>
              </div>
            </div>
          </section>

          <section className="media-slide media-slide-tires">
            <div className="media-tire-panel">
              <div className="media-tire-copy">
                <h4>Tire Pressure</h4>
                <p>Recommended Front 42 psi</p>
                <p>Recommended Rear 42 psi</p>
              </div>
              <div className="media-tire-visual">
                <img src={tireCarImage} alt="Tire pressure car view" />
                <span className="tire-psi top-left">43 psi</span>
                <span className="tire-psi top-right">44 psi</span>
                <span className="tire-psi bottom-left">44 psi</span>
                <span className="tire-psi bottom-right">44 psi</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="media-carousel-dots">
        {[0, 1, 2].map((dot) => (
          <button
            key={dot}
            className={dot === carouselIndex ? 'media-dot active' : 'media-dot'}
            onClick={() => setCarouselIndex(dot)}
            aria-label={`carousel page ${dot + 1}`}
          />
        ))}
      </div>
    </article>
  );
}

interface ImmersiveNavigationCardProps {
  searchValue: string;
  onSearchClick: () => void;
  onQuickDestination: (destination: string) => void;
}

function ImmersiveNavigationCard({
  searchValue,
  onSearchClick,
  onQuickDestination
}: ImmersiveNavigationCardProps) {
  return (
    <article className="immersive-nav-card">
      <button className="immersive-nav-search" onClick={onSearchClick}>
        <Search size={20} />
        <span>{searchValue.trim() ? searchValue : 'Navigate'}</span>
      </button>
      <div className="immersive-nav-actions">
        <button onClick={() => onQuickDestination('Home')}>
          <House size={18} />
          <span>Home</span>
        </button>
        <button onClick={() => onQuickDestination('Work')}>
          <BriefcaseBusiness size={18} />
          <span>Work</span>
        </button>
      </div>
    </article>
  );
}

interface RightPaneProps {
  mode: RightPaneMode;
  navigationState: NavigationState;
  searchValue: string;
  settingsState: SettingsState;
  selectedAppName: string;
  mapViewport: MapViewport;
  onSearchClick: () => void;
  onEndTrip: () => void;
  onActivateMap: () => void;
  onMapViewportChange: (viewport: MapViewport) => void;
  onQuickDestination: (destination: string) => void;
  onSettingsCategoryChange: (category: SettingsCategory) => void;
  onSettingChange: (id: string, value: SettingValue) => void;
}

function RightPane({
  mode,
  navigationState,
  searchValue,
  settingsState,
  selectedAppName,
  mapViewport,
  onSearchClick,
  onEndTrip,
  onActivateMap,
  onMapViewportChange,
  onQuickDestination,
  onSettingsCategoryChange,
  onSettingChange
}: RightPaneProps) {
  const isOverlayMode = mode !== 'MAP';
  const [overlayOffsetY, setOverlayOffsetY] = useState(0);
  const [isOverlayDragging, setIsOverlayDragging] = useState(false);
  const overlayDragRef = useRef<{ startY: number } | null>(null);

  useEffect(() => {
    overlayDragRef.current = null;
    setIsOverlayDragging(false);
    setOverlayOffsetY(0);
  }, [mode]);

  const startOverlayDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!isOverlayMode) {
      return;
    }
    const target = event.target as HTMLElement;
    if (!target.closest('[data-pane-drag-handle="true"]')) {
      return;
    }
    overlayDragRef.current = { startY: event.clientY };
    setIsOverlayDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveOverlayDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!overlayDragRef.current) {
      return;
    }
    const deltaY = event.clientY - overlayDragRef.current.startY;
    setOverlayOffsetY(clamp(deltaY, 0, 520));
  };

  const endOverlayDrag = () => {
    if (!overlayDragRef.current) {
      return;
    }
    const shouldDismiss = overlayOffsetY > 110;
    overlayDragRef.current = null;
    setIsOverlayDragging(false);
    setOverlayOffsetY(0);
    if (shouldDismiss) {
      onActivateMap();
    }
  };

  return (
    <section className="right-pane-stack">
      <MapPane
        navigationState={navigationState}
        searchValue={searchValue}
        mapViewport={mapViewport}
        onSearchClick={onSearchClick}
        onEndTrip={onEndTrip}
        onMapViewportChange={onMapViewportChange}
        onQuickDestination={onQuickDestination}
      />

      {mode !== 'MAP' && (
        <div
          className={`right-overlay-pane ${mode === 'APP' ? 'app' : 'settings'} ${isOverlayDragging ? 'dragging' : ''}`}
          style={{ transform: `translateY(${overlayOffsetY}px)` }}
          onPointerDown={startOverlayDrag}
          onPointerMove={moveOverlayDrag}
          onPointerUp={endOverlayDrag}
          onPointerCancel={endOverlayDrag}
        >
          <div className="pane-drag-region" data-pane-drag-handle="true">
            <span className="pane-drag-region-bar" data-pane-drag-handle="true" />
          </div>
          <div className="right-overlay-content">
            {mode === 'SETTINGS' ? (
              <SettingsPane
                settingsState={settingsState}
                onCategoryChange={onSettingsCategoryChange}
                onSettingChange={onSettingChange}
              />
            ) : (
              <AppPane appName={selectedAppName} onBackToMap={onActivateMap} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

interface MapPaneProps {
  navigationState: NavigationState;
  searchValue: string;
  mapViewport: MapViewport;
  onSearchClick: () => void;
  onEndTrip: () => void;
  onMapViewportChange: (viewport: MapViewport) => void;
  onQuickDestination: (destination: string) => void;
}

function MapPane({
  navigationState,
  searchValue,
  mapViewport,
  onSearchClick,
  onEndTrip,
  onMapViewportChange,
  onQuickDestination
}: MapPaneProps) {
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(
    null
  );

  const zoom = (delta: number) => {
    onMapViewportChange({
      ...mapViewport,
      zoom: clamp(mapViewport.zoom + delta, 0.75, 2.6)
    });
  };

  const resetViewport = () => {
    onMapViewportChange({ zoom: 1, panX: 0, panY: 0 });
  };

  const startMapDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: mapViewport.panX,
      panY: mapViewport.panY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveMapDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return;
    }
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    onMapViewportChange({
      ...mapViewport,
      panX: dragRef.current.panX + deltaX,
      panY: dragRef.current.panY + deltaY
    });
  };

  const endMapDrag = () => {
    dragRef.current = null;
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoom(event.deltaY > 0 ? -0.08 : 0.08);
  };

  return (
    <section className="map-pane">
      <button className="map-search-bar" onClick={onSearchClick}>
        <Search className="map-search-icon" size={18} />
        <span>{searchValue.trim() ? searchValue : 'Navigate...'}</span>
      </button>
      {!navigationState.active && (
        <div className="map-quick-destinations">
          <button onClick={() => onQuickDestination('Home')}>Home</button>
          <button onClick={() => onQuickDestination('Work')}>Work</button>
        </div>
      )}

      <div
        className="map-canvas"
        onPointerDown={startMapDrag}
        onPointerMove={moveMapDrag}
        onPointerUp={endMapDrag}
        onPointerCancel={endMapDrag}
        onWheel={handleWheel}
      >
        <div
          className="map-world"
          style={{
            transform: `translate(${mapViewport.panX}px, ${mapViewport.panY}px) scale(${mapViewport.zoom})`
          }}
        >
          <div className="map-sample-base" />
          <div className="map-grid" />
          {SAMPLE_MAP_STREETS.map((street) => (
            <div
              key={street.id}
              className={`map-street ${street.level}`}
              style={{
                left: `${street.x}%`,
                top: `${street.y}%`,
                width: `${street.length}%`,
                transform: `translateY(-50%) rotate(${street.angle}deg)`
              }}
            />
          ))}
          {SAMPLE_MAP_LABELS.map((label) => (
            <span
              key={label.id}
              className={`map-street-label ${label.tone}`}
              style={{
                left: `${label.x}%`,
                top: `${label.y}%`,
                transform: `rotate(${label.angle}deg)`
              }}
            >
              {label.text}
            </span>
          ))}
          {SAMPLE_MAP_POIS.map((poi) => (
            <span
              key={poi.id}
              className={`map-poi ${poi.type}`}
              style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
            />
          ))}
          {navigationState.active && <div className="route-polyline" />}
          {navigationState.active && <div className="map-pin start">S</div>}
          {navigationState.active && <div className="map-pin end">E</div>}
        </div>

        <div className="map-control-stack" onPointerDown={(event) => event.stopPropagation()}>
          <button onClick={() => zoom(0.12)} aria-label="zoom in">
            <Plus size={17} />
          </button>
          <button onClick={() => zoom(-0.12)} aria-label="zoom out">
            <Minus size={17} />
          </button>
          <button onClick={resetViewport} aria-label="reset viewport">
            <RotateCcw size={16} />
          </button>
          <button onClick={onSearchClick} aria-label="search">
            <LocateFixed size={17} />
          </button>
        </div>

        <button
          className="compass-button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={resetViewport}
        >
          {Math.round(mapViewport.zoom * 100)}%
        </button>

        <div className="map-sample-location">Sample Map • Los Angeles, CA</div>

        {navigationState.active && (
          <NavigationOverlay navigationState={navigationState} onEndTrip={onEndTrip} />
        )}
      </div>
    </section>
  );
}

interface NavigationOverlayProps {
  navigationState: NavigationState;
  onEndTrip: () => void;
}

function NavigationOverlay({ navigationState, onEndTrip }: NavigationOverlayProps) {
  return (
    <>
      <article className="turn-by-turn-card">
        <div className="turn-primary-line">
          <h3>{navigationState.currentStep.distance}</h3>
          <p>{navigationState.currentStep.instruction}</p>
        </div>
        <ul>
          {navigationState.nextSteps.map((step) => (
            <li key={`${step.distance}-${step.instruction}`}>
              <span>{step.distance}</span>
              <span>{step.instruction}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="trip-summary-card">
        <div className="trip-destination">
          <strong>{navigationState.destination}</strong>
          <p>ETA {navigationState.eta}</p>
        </div>
        <div className="trip-meta">
          <span>{navigationState.distance}</span>
          <span>{navigationState.batteryAtArrival} arrival</span>
        </div>
        <div className="trip-actions">
          <button onClick={onEndTrip}>End Trip</button>
          <button>More</button>
        </div>
      </article>
    </>
  );
}

interface SettingsPaneProps {
  settingsState: SettingsState;
  onCategoryChange: (category: SettingsCategory) => void;
  onSettingChange: (id: string, value: SettingValue) => void;
}

function SettingsPane({
  settingsState,
  onCategoryChange,
  onSettingChange
}: SettingsPaneProps) {
  const [settingsSearch, setSettingsSearch] = useState('');
  const searchToken = settingsSearch.trim().toLowerCase();
  const visibleCategories = SETTINGS_CATEGORIES.filter((category) =>
    SETTINGS_CATEGORY_META[category].label.toLowerCase().includes(searchToken)
  );

  useEffect(() => {
    if (visibleCategories.length === 0) {
      return;
    }
    if (!visibleCategories.includes(settingsState.activeCategory)) {
      onCategoryChange(visibleCategories[0]);
    }
  }, [onCategoryChange, settingsState.activeCategory, visibleCategories]);

  return (
    <section className="settings-pane">
      <aside className="settings-sidebar">
        <input
          className="settings-search-input"
          placeholder="Search Settings"
          value={settingsSearch}
          onChange={(event) => setSettingsSearch(event.target.value)}
        />
        {visibleCategories.map((category) => {
          const CategoryIcon = SETTINGS_CATEGORY_META[category].icon;
          return (
            <button
              key={category}
              className={
                settingsState.activeCategory === category
                  ? 'settings-category active'
                  : 'settings-category'
              }
              onClick={() => onCategoryChange(category)}
            >
              <span className="settings-category-icon">
                <CategoryIcon className="settings-category-icon-svg" />
              </span>
              <span className="settings-category-text">
                {SETTINGS_CATEGORY_META[category].label}
              </span>
            </button>
          );
        })}
        {visibleCategories.length === 0 && (
          <div className="settings-empty-result">No matching category</div>
        )}
      </aside>

      <div className="settings-main">
        <header className="settings-header">
          <div className="settings-header-title">
            <User size={18} />
            <h2>Easy Entry</h2>
          </div>
          <div className="settings-header-actions">
            <button title="Download">
              <Download size={14} />
            </button>
            <button title="Notifications">
              <Bell size={14} />
            </button>
            <button title="Bluetooth">
              <Bluetooth size={14} />
            </button>
            <button title="Signal">
              <Signal size={14} />
            </button>
          </div>
        </header>

        <div className="settings-content">
          <SettingsCategoryContent
            settingsState={settingsState}
            onSettingChange={onSettingChange}
          />
        </div>
      </div>
    </section>
  );
}

interface SettingsCategoryContentProps {
  settingsState: SettingsState;
  onSettingChange: (id: string, value: SettingValue) => void;
}

function SettingsCategoryContent({
  settingsState,
  onSettingChange
}: SettingsCategoryContentProps) {
  const values = settingsState.values;
  const bool = (id: string) => Boolean(values[id]);
  const text = (id: string) => String(values[id] ?? '');
  const num = (id: string) => Number(values[id] ?? 0);

  const autosteerEnabled = bool('autopilot-autosteer-beta');
  const navOnAutopilotEnabled =
    autosteerEnabled && bool('autopilot-navigate-on-autopilot');

  switch (settingsState.activeCategory) {
    case 'CONTROLS':
      return (
        <>
          <SettingGroupHeader title="Quick Controls" />
          <SegmentedControlRow
            label="Headlights"
            options={['OFF', 'PARK', 'ON', 'AUTO']}
            value={text('controls-headlights')}
            onChange={(next) => onSettingChange('controls-headlights', next)}
          />
          <TileGrid
            tiles={[
              {
                id: 'controls-fold-mirrors',
                label: 'Fold Mirrors',
                active: bool('controls-fold-mirrors')
              },
              {
                id: 'controls-child-lock',
                label: 'Child Lock',
                active: bool('controls-child-lock')
              },
              {
                id: 'controls-window-lock',
                label: 'Window Lock',
                active: bool('controls-window-lock')
              },
              {
                id: 'controls-glovebox-open',
                label: bool('controls-glovebox-open') ? 'Glovebox Open' : 'Glovebox',
                active: bool('controls-glovebox-open')
              }
            ]}
            onToggle={(id, value) => onSettingChange(id, value)}
          />
          <SegmentedControlRow
            label="Wipers"
            options={['OFF', 'I', 'II', 'AUTO']}
            value={text('controls-wipers-mode')}
            onChange={(next) => onSettingChange('controls-wipers-mode', next)}
          />
          <ToggleRow
            label="Auto High Beam"
            value={bool('controls-auto-high-beam')}
            disabled={text('controls-headlights') !== 'AUTO'}
            description="Available only when headlights are set to AUTO"
            onChange={(next) => onSettingChange('controls-auto-high-beam', next)}
          />
          <ToggleRow
            label="Sentry Mode"
            value={bool('controls-sentry-mode')}
            onChange={(next) => onSettingChange('controls-sentry-mode', next)}
          />
          <ToggleRow
            label="Dashcam Auto Save"
            value={bool('controls-dashcam-auto-save')}
            onChange={(next) => onSettingChange('controls-dashcam-auto-save', next)}
          />
          <SettingGroupHeader title="Mirrors & Steering" />
          <TabsRow
            label="Mirror Select"
            options={['LEFT', 'RIGHT']}
            value={text('controls-mirror-select')}
            onChange={(next) => onSettingChange('controls-mirror-select', next)}
          />
          <SliderRow
            label="Mirror Angle"
            min={-10}
            max={10}
            value={num('controls-mirror-angle')}
            onChange={(next) => onSettingChange('controls-mirror-angle', next)}
          />
          <SliderRow
            label="Steering Height"
            min={-5}
            max={5}
            value={num('controls-steering-height')}
            onChange={(next) => onSettingChange('controls-steering-height', next)}
          />
          <SliderRow
            label="Steering Reach"
            min={-5}
            max={5}
            value={num('controls-steering-reach')}
            onChange={(next) => onSettingChange('controls-steering-reach', next)}
          />
        </>
      );

    case 'DYNAMICS':
      return (
        <>
          <SettingGroupHeader title="Pedals & Steering" />
          <SegmentedControlRow
            label="Acceleration"
            options={['CHILL', 'STANDARD']}
            value={text('dynamics-acceleration')}
            onChange={(next) => onSettingChange('dynamics-acceleration', next)}
          />
          <SegmentedControlRow
            label="Steering Mode"
            options={['COMFORT', 'STANDARD', 'SPORT']}
            value={text('dynamics-steering-mode')}
            onChange={(next) => onSettingChange('dynamics-steering-mode', next)}
          />
          <SegmentedControlRow
            label="Stopping Mode"
            options={['CREEP', 'ROLL', 'HOLD']}
            value={text('dynamics-stopping-mode')}
            onChange={(next) => onSettingChange('dynamics-stopping-mode', next)}
            description="Extends regenerative braking to low speeds and holds vehicle at stop in HOLD mode."
          />
          <ToggleRow
            label="Slip Start"
            value={bool('dynamics-slip-start')}
            onChange={(next) => onSettingChange('dynamics-slip-start', next)}
          />
          <ToggleRow
            label="Track Mode (Beta)"
            value={bool('dynamics-track-mode')}
            onChange={(next) => onSettingChange('dynamics-track-mode', next)}
          />
          <ToggleRow
            label="Regenerative Braking"
            value={bool('dynamics-regen-braking')}
            onChange={(next) => onSettingChange('dynamics-regen-braking', next)}
          />
        </>
      );

    case 'CHARGING':
      return (
        <>
          <SettingGroupHeader title="Charging" />
          <SliderRow
            label="Charge Limit"
            min={50}
            max={100}
            value={num('charging-charge-limit')}
            onChange={(next) => onSettingChange('charging-charge-limit', next)}
          />
          <StepperRow
            label="Charging Current"
            value={num('charging-current-amps')}
            min={5}
            max={48}
            unit="A"
            onChange={(next) => onSettingChange('charging-current-amps', next)}
          />
          <ToggleRow
            label="Scheduled Charging"
            value={bool('charging-scheduled-charging')}
            onChange={(next) => onSettingChange('charging-scheduled-charging', next)}
          />
          <ToggleRow
            label="Off-Peak Charging"
            value={bool('charging-off-peak')}
            onChange={(next) => onSettingChange('charging-off-peak', next)}
          />
          <ToggleRow
            label="Precondition Battery"
            value={bool('charging-precondition')}
            onChange={(next) => onSettingChange('charging-precondition', next)}
          />
          <ToggleRow
            label="Trip Planner Preconditioning"
            value={bool('charging-trip-planner-precondition')}
            onChange={(next) => onSettingChange('charging-trip-planner-precondition', next)}
          />
          <SecondaryActionLink label="Open Charging Stats" />
        </>
      );

    case 'AUTOPILOT':
      return (
        <>
          <SettingGroupHeader title="Autopilot" />
          <ToggleRow
            label="Autosteer (Beta)"
            value={bool('autopilot-autosteer-beta')}
            onChange={(next) => onSettingChange('autopilot-autosteer-beta', next)}
          />
          <ToggleRow
            label="Navigate on Autopilot (Beta)"
            value={bool('autopilot-navigate-on-autopilot')}
            disabled={!autosteerEnabled}
            description={!autosteerEnabled ? 'Enable Autosteer first' : undefined}
            onChange={(next) => onSettingChange('autopilot-navigate-on-autopilot', next)}
          />
          <ToggleRow
            label="Auto Lane Change"
            value={bool('autopilot-auto-lane-change')}
            disabled={!navOnAutopilotEnabled}
            description={!navOnAutopilotEnabled ? 'Requires Navigate on Autopilot' : undefined}
            onChange={(next) => onSettingChange('autopilot-auto-lane-change', next)}
          />
          <ToggleRow
            label="Traffic Light and Stop Sign Control"
            value={bool('autopilot-traffic-light-stop')}
            disabled={!autosteerEnabled}
            onChange={(next) => onSettingChange('autopilot-traffic-light-stop', next)}
          />
          <ToggleRow
            label="Summon Standby"
            value={bool('autopilot-summon-standby')}
            disabled={!autosteerEnabled}
            onChange={(next) => onSettingChange('autopilot-summon-standby', next)}
          />
          <SegmentedControlRow
            label="FSD Profile"
            options={['CHILL', 'AVERAGE', 'ASSERTIVE']}
            value={text('autopilot-fsd-profile')}
            disabled={!navOnAutopilotEnabled}
            onChange={(next) => onSettingChange('autopilot-fsd-profile', next)}
          />
          <SettingGroupHeader title="Safety Assist" />
          <SegmentedControlRow
            label="Forward Collision Warning"
            options={['OFF', 'LATE', 'MEDIUM', 'EARLY']}
            value={text('autopilot-forward-collision-warning')}
            onChange={(next) => onSettingChange('autopilot-forward-collision-warning', next)}
          />
          <SegmentedControlRow
            label="Lane Departure Avoidance"
            options={['OFF', 'WARNING', 'ASSIST']}
            value={text('autopilot-lane-departure-avoidance')}
            onChange={(next) => onSettingChange('autopilot-lane-departure-avoidance', next)}
          />
          <SegmentedControlRow
            label="Speed Limit Warning"
            options={['OFF', 'DISPLAY', 'CHIME']}
            value={text('autopilot-speed-limit-warning')}
            onChange={(next) => onSettingChange('autopilot-speed-limit-warning', next)}
          />
          <SliderRow
            label="Following Distance"
            min={2}
            max={7}
            step={1}
            value={num('autopilot-following-distance')}
            onChange={(next) => onSettingChange('autopilot-following-distance', next)}
          />
          <ToggleRow
            label="Emergency Lane Departure Avoidance"
            value={bool('autopilot-emergency-lane-departure')}
            onChange={(next) => onSettingChange('autopilot-emergency-lane-departure', next)}
          />
          <ToggleRow
            label="Blind Spot Camera"
            value={bool('autopilot-blind-spot-camera')}
            onChange={(next) => onSettingChange('autopilot-blind-spot-camera', next)}
          />
          <ToggleRow
            label="Automatic Emergency Braking"
            value={bool('autopilot-automatic-emergency-braking')}
            onChange={(next) => onSettingChange('autopilot-automatic-emergency-braking', next)}
          />
          <ToggleRow
            label="Obstacle-Aware Acceleration"
            value={bool('autopilot-obstacle-aware-acceleration')}
            onChange={(next) => onSettingChange('autopilot-obstacle-aware-acceleration', next)}
          />
        </>
      );

    case 'LOCKS':
      return (
        <>
          <SettingGroupHeader title="Locks" />
          <ToggleRow
            label="Walk-Away Door Lock"
            value={bool('locks-walk-away')}
            onChange={(next) => onSettingChange('locks-walk-away', next)}
          />
          <ToggleRow
            label="Unlock on Park"
            value={bool('locks-unlock-on-park')}
            onChange={(next) => onSettingChange('locks-unlock-on-park', next)}
          />
          <ToggleRow
            label="Driver Door Unlock Mode"
            value={bool('locks-driver-door-unlock')}
            onChange={(next) => onSettingChange('locks-driver-door-unlock', next)}
          />
          <ToggleRow
            label="Rear Child Lock"
            value={bool('locks-child-lock')}
            onChange={(next) => onSettingChange('locks-child-lock', next)}
          />
          <ToggleRow
            label="Lock Confirmation Sound"
            value={bool('locks-lock-sound')}
            onChange={(next) => onSettingChange('locks-lock-sound', next)}
          />
          <ActionRow
            label="Valet Mode"
            buttonLabel={bool('locks-valet-mode') ? 'Disable' : 'Enable'}
            onAction={() => onSettingChange('locks-valet-mode', !bool('locks-valet-mode'))}
          />
        </>
      );

    case 'LIGHTS':
      return (
        <>
          <SettingGroupHeader title="Lights" />
          <SegmentedControlRow
            label="Headlights"
            options={['OFF', 'PARK', 'ON', 'AUTO']}
            value={text('lights-headlights')}
            onChange={(next) => onSettingChange('lights-headlights', next)}
          />
          <ToggleRow
            label="Dome Lights Auto"
            value={bool('lights-dome-auto')}
            onChange={(next) => onSettingChange('lights-dome-auto', next)}
          />
          <ToggleRow
            label="Auto High Beam"
            value={bool('lights-auto-high-beam')}
            disabled={text('lights-headlights') !== 'AUTO'}
            onChange={(next) => onSettingChange('lights-auto-high-beam', next)}
          />
          <ToggleRow
            label="Fog Lights"
            value={bool('lights-fog-lights')}
            onChange={(next) => onSettingChange('lights-fog-lights', next)}
          />
          <ToggleRow
            label="Ambient Lights"
            value={bool('lights-ambient-lights')}
            onChange={(next) => onSettingChange('lights-ambient-lights', next)}
          />
        </>
      );

    case 'SEATS':
      return (
        <>
          <SettingGroupHeader title="Seats" />
          <SliderRow
            label="Driver Seat Heat"
            min={0}
            max={3}
            step={1}
            value={num('seats-driver-heat')}
            onChange={(next) => onSettingChange('seats-driver-heat', next)}
          />
          <SliderRow
            label="Passenger Seat Heat"
            min={0}
            max={3}
            step={1}
            value={num('seats-passenger-heat')}
            onChange={(next) => onSettingChange('seats-passenger-heat', next)}
          />
          <ToggleRow
            label="Easy Entry"
            value={bool('seats-easy-entry')}
            onChange={(next) => onSettingChange('seats-easy-entry', next)}
          />
          <ToggleRow
            label="Rear Seat Heaters"
            value={bool('seats-rear-heaters')}
            onChange={(next) => onSettingChange('seats-rear-heaters', next)}
          />
          <ToggleRow
            label="Seatbelt Reminder"
            value={bool('seats-seatbelt-reminder')}
            onChange={(next) => onSettingChange('seats-seatbelt-reminder', next)}
          />
        </>
      );

    case 'DISPLAY':
      return (
        <>
          <SettingGroupHeader title="Display" />
          <SliderRow
            label="Brightness"
            min={0}
            max={100}
            value={num('display-brightness')}
            onChange={(next) => onSettingChange('display-brightness', next)}
          />
          <SegmentedControlRow
            label="Appearance"
            options={['AUTO', 'LIGHT', 'DARK']}
            value={text('display-appearance')}
            onChange={(next) => onSettingChange('display-appearance', next)}
          />
          <ToggleRow
            label="Night Shift"
            value={bool('display-night-shift')}
            onChange={(next) => onSettingChange('display-night-shift', next)}
          />
          <TabsRow
            label="Distance Unit"
            options={['MI', 'KM']}
            value={text('display-distance-unit')}
            onChange={(next) => onSettingChange('display-distance-unit', next)}
          />
          <TabsRow
            label="Temperature Unit"
            options={['F', 'C']}
            value={text('display-temperature-unit')}
            onChange={(next) => onSettingChange('display-temperature-unit', next)}
          />
          <TabsRow
            label="Clock Format"
            options={['12H', '24H']}
            value={text('display-clock-format')}
            onChange={(next) => onSettingChange('display-clock-format', next)}
          />
          <TabsRow
            label="Language"
            options={['EN', 'KR']}
            value={text('display-language')}
            onChange={(next) => onSettingChange('display-language', next)}
          />
          <TabsRow
            label="Range View"
            options={['EST', 'IDEAL']}
            value={text('display-range-view')}
            onChange={(next) => onSettingChange('display-range-view', next)}
          />
        </>
      );

    case 'SCHEDULE':
      return (
        <>
          <SettingGroupHeader title="Schedule" />
          <ToggleRow
            label="Off-Peak Charging"
            value={bool('schedule-off-peak')}
            onChange={(next) => onSettingChange('schedule-off-peak', next)}
          />
          <TabsRow
            label="Departure Days"
            options={['WEEKDAYS', 'DAILY']}
            value={text('schedule-departure-days')}
            onChange={(next) => onSettingChange('schedule-departure-days', next)}
          />
          <StepperRow
            label="Departure Hour"
            value={num('schedule-departure-hour')}
            min={0}
            max={23}
            unit=":00"
            onChange={(next) => onSettingChange('schedule-departure-hour', next)}
          />
          <ToggleRow
            label="Precondition Cabin"
            value={bool('schedule-precondition')}
            onChange={(next) => onSettingChange('schedule-precondition', next)}
          />
          <ToggleRow
            label="Cabin Overheat Protection"
            value={bool('schedule-cabin-overheat')}
            onChange={(next) => onSettingChange('schedule-cabin-overheat', next)}
          />
        </>
      );

    case 'SAFETY':
      return (
        <>
          <SettingGroupHeader title="Safety" />
          <ToggleRow
            label="Sentry Mode"
            value={bool('safety-sentry-mode')}
            onChange={(next) => onSettingChange('safety-sentry-mode', next)}
          />
          <ToggleRow
            label="Security Alarm"
            value={bool('safety-security-alarm')}
            onChange={(next) => onSettingChange('safety-security-alarm', next)}
          />
          <ToggleRow
            label="PIN to Drive"
            value={bool('safety-pin-to-drive')}
            onChange={(next) => onSettingChange('safety-pin-to-drive', next)}
          />
          <SegmentedControlRow
            label="Speed Limit Warning"
            options={['OFF', 'DISPLAY', 'CHIME']}
            value={text('safety-speed-limit-warning')}
            onChange={(next) => onSettingChange('safety-speed-limit-warning', next)}
          />
          <ActionRow
            label="Parental Controls"
            buttonLabel={bool('safety-parental-controls') ? 'Configured' : 'Open'}
            onAction={() =>
              onSettingChange('safety-parental-controls', !bool('safety-parental-controls'))
            }
          />
        </>
      );

    case 'SERVICE':
      return (
        <>
          <SettingGroupHeader title="Service" />
          <StatusRow label="Front Left Tire" value={`${num('service-front-left-psi')} PSI`} />
          <StatusRow label="Front Right Tire" value={`${num('service-front-right-psi')} PSI`} />
          <StatusRow label="Rear Left Tire" value={`${num('service-rear-left-psi')} PSI`} />
          <StatusRow label="Rear Right Tire" value={`${num('service-rear-right-psi')} PSI`} />
          <ToggleRow
            label="Car Wash Mode"
            value={bool('service-car-wash-mode')}
            onChange={(next) => onSettingChange('service-car-wash-mode', next)}
          />
          <ToggleRow
            label="Wiper Service Mode"
            value={bool('service-wiper-service-mode')}
            onChange={(next) => onSettingChange('service-wiper-service-mode', next)}
          />
          <ActionRow
            label="Cameras"
            buttonLabel={bool('service-camera-calibrating') ? 'Calibrating...' : 'Calibrate'}
            onAction={() =>
              onSettingChange('service-camera-calibrating', !bool('service-camera-calibrating'))
            }
          />
        </>
      );

    case 'SOFTWARE':
      return (
        <>
          <SettingGroupHeader title="Software" />
          <StatusRow label="Current Version" value={text('software-version')} />
          <StatusRow label="Last Check" value={text('software-last-check')} />
          <TabsRow
            label="Update Channel"
            options={['STANDARD', 'ADVANCED']}
            value={text('software-update-channel')}
            onChange={(next) => onSettingChange('software-update-channel', next)}
          />
          <ToggleRow
            label="Beta Updates"
            value={bool('software-beta-updates')}
            onChange={(next) => onSettingChange('software-beta-updates', next)}
          />
          <ToggleRow
            label="Auto Download over Wi-Fi"
            value={bool('software-auto-download')}
            onChange={(next) => onSettingChange('software-auto-download', next)}
          />
          <SecondaryActionLink
            label={bool('software-checking-update') ? 'Checking for Updates...' : 'Check for Updates'}
            onClick={() =>
              onSettingChange('software-checking-update', !bool('software-checking-update'))
            }
          />
        </>
      );

    case 'NAVIGATION':
      return (
        <>
          <SettingGroupHeader title="Navigation" />
          <ToggleRow
            label="Online Routing"
            value={bool('navigation-online-routing')}
            onChange={(next) => onSettingChange('navigation-online-routing', next)}
          />
          <ToggleRow
            label="Avoid Tolls"
            value={bool('navigation-avoid-tolls')}
            onChange={(next) => onSettingChange('navigation-avoid-tolls', next)}
          />
          <ToggleRow
            label="Avoid Highways"
            value={bool('navigation-avoid-highways')}
            onChange={(next) => onSettingChange('navigation-avoid-highways', next)}
          />
          <ToggleRow
            label="Avoid Ferries"
            value={bool('navigation-avoid-ferries')}
            onChange={(next) => onSettingChange('navigation-avoid-ferries', next)}
          />
          <TabsRow
            label="Map Color"
            options={['AUTO', 'DAY', 'NIGHT']}
            value={text('navigation-map-color')}
            onChange={(next) => onSettingChange('navigation-map-color', next)}
          />
          <SegmentedControlRow
            label="Voice Guidance"
            options={['OFF', 'LOW', 'NORMAL', 'HIGH']}
            value={text('navigation-voice-guidance')}
            onChange={(next) => onSettingChange('navigation-voice-guidance', next)}
          />
          <ToggleRow
            label="Home & Work Suggestions"
            value={bool('navigation-home-work-suggestions')}
            onChange={(next) => onSettingChange('navigation-home-work-suggestions', next)}
          />
        </>
      );

    case 'TRIPS':
      return (
        <>
          <SettingGroupHeader title="Trips" />
          <StatusRow label="Since Charge" value={text('trips-since-charge')} />
          <StatusRow label="Trip A" value={text('trips-trip-a')} />
          <StatusRow label="Trip B" value={text('trips-trip-b')} />
          <ActionRow label="Trip A" buttonLabel="Reset" onAction={() => onSettingChange('trips-trip-a', '0.0 mi')} />
          <ActionRow label="Trip B" buttonLabel="Reset" onAction={() => onSettingChange('trips-trip-b', '0.0 mi')} />
        </>
      );

    case 'WIFI':
      return (
        <>
          <SettingGroupHeader title="Wi-Fi" />
          <ToggleRow
            label="Wi-Fi"
            value={bool('wifi-enabled')}
            onChange={(next) => onSettingChange('wifi-enabled', next)}
          />
          <StatusRow label="Connected Network" value={text('wifi-network-name')} />
          <ToggleRow
            label="Auto Join"
            value={bool('wifi-auto-join')}
            disabled={!bool('wifi-enabled')}
            onChange={(next) => onSettingChange('wifi-auto-join', next)}
          />
          <ActionRow
            label="Networks"
            buttonLabel={bool('wifi-searching') ? 'Searching...' : 'Scan'}
            onAction={() => onSettingChange('wifi-searching', !bool('wifi-searching'))}
          />
        </>
      );

    case 'BLUETOOTH':
      return (
        <>
          <SettingGroupHeader title="Bluetooth" />
          <ToggleRow
            label="Bluetooth"
            value={bool('bluetooth-enabled')}
            onChange={(next) => onSettingChange('bluetooth-enabled', next)}
          />
          <ToggleRow
            label="Phone Key"
            value={bool('bluetooth-phone-key')}
            disabled={!bool('bluetooth-enabled')}
            onChange={(next) => onSettingChange('bluetooth-phone-key', next)}
          />
          <StatusRow label="Primary Device" value={text('bluetooth-primary-device')} />
          <ActionRow
            label="Pairing"
            buttonLabel={bool('bluetooth-pairing-mode') ? 'Stop Pairing' : 'Pair Device'}
            onAction={() =>
              onSettingChange('bluetooth-pairing-mode', !bool('bluetooth-pairing-mode'))
            }
          />
        </>
      );

    case 'AUDIO':
      return (
        <>
          <SettingGroupHeader title="Audio" />
          <SliderRow
            label="Immersive Sound"
            min={0}
            max={100}
            value={num('audio-immersive-sound')}
            onChange={(next) => onSettingChange('audio-immersive-sound', next)}
          />
          <SliderRow
            label="Bass"
            min={-10}
            max={10}
            value={num('audio-bass')}
            onChange={(next) => onSettingChange('audio-bass', next)}
          />
          <SliderRow
            label="Mid"
            min={-10}
            max={10}
            value={num('audio-mid')}
            onChange={(next) => onSettingChange('audio-mid', next)}
          />
          <SliderRow
            label="Treble"
            min={-10}
            max={10}
            value={num('audio-treble')}
            onChange={(next) => onSettingChange('audio-treble', next)}
          />
          <ToggleRow
            label="Speed-Dependent Volume"
            value={bool('audio-speed-volume')}
            onChange={(next) => onSettingChange('audio-speed-volume', next)}
          />
          <TabsRow
            label="Streaming Quality"
            options={['STANDARD', 'HIGH']}
            value={text('audio-quality')}
            onChange={(next) => onSettingChange('audio-quality', next)}
          />
        </>
      );

    case 'UPGRADES':
      return (
        <>
          <SettingGroupHeader title="Upgrades" />
          <TileGrid
            tiles={[
              {
                id: 'upgrades-autopilot',
                label: 'Autopilot',
                active: bool('upgrades-autopilot')
              },
              {
                id: 'upgrades-acceleration-boost',
                label: 'Acceleration Boost',
                active: bool('upgrades-acceleration-boost')
              },
              {
                id: 'upgrades-premium-connectivity',
                label: 'Premium Connectivity',
                active: bool('upgrades-premium-connectivity')
              },
              {
                id: 'upgrades-rear-heated-seats',
                label: 'Rear Heated Seats',
                active: bool('upgrades-rear-heated-seats')
              }
            ]}
            onToggle={(id, value) => onSettingChange(id, value)}
          />
          <SecondaryActionLink label="Open Upgrade Shop" />
        </>
      );

    default:
      return null;
  }
}

function SettingGroupHeader({ title }: { title: string }) {
  return (
    <div className="setting-group-header">
      <h3>{title}</h3>
      <span>i</span>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  disabled?: boolean;
  description?: string;
  onChange: (value: boolean) => void;
}

function ToggleRow({ label, value, disabled = false, description, onChange }: ToggleRowProps) {
  return (
    <div className={`setting-row ${disabled ? 'disabled' : ''}`}>
      <div className="setting-row-text">
        <span>{label}</span>
        {description && <p className="setting-inline-note">{description}</p>}
      </div>
      <button
        className={value ? 'toggle on' : 'toggle'}
        onClick={() => onChange(!value)}
        disabled={disabled}
      >
        {value ? 'On' : 'Off'}
      </button>
    </div>
  );
}

interface SegmentedControlRowProps {
  label: string;
  options: string[];
  value: string;
  disabled?: boolean;
  description?: string;
  onChange: (value: string) => void;
}

function SegmentedControlRow({
  label,
  options,
  value,
  disabled = false,
  description,
  onChange
}: SegmentedControlRowProps) {
  return (
    <div className={`setting-row with-column ${disabled ? 'disabled' : ''}`}>
      <div className="setting-row-text">
        <span>{label}</span>
        {description && <p className="setting-inline-note">{description}</p>}
      </div>
      <div className="segmented-control">
        {options.map((option) => (
          <button
            key={option}
            className={option === value ? 'segment active' : 'segment'}
            onClick={() => onChange(option)}
            disabled={disabled}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  value: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function SliderRow({
  label,
  min,
  max,
  value,
  step = 1,
  disabled = false,
  onChange
}: SliderRowProps) {
  return (
    <div className={`setting-row with-column ${disabled ? 'disabled' : ''}`}>
      <div className="slider-row-header">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
      />
    </div>
  );
}

interface TileGridItem {
  id: string;
  label: string;
  active: boolean;
}

interface TileGridProps {
  tiles: TileGridItem[];
  onToggle: (id: string, value: boolean) => void;
}

function TileGrid({ tiles, onToggle }: TileGridProps) {
  return (
    <div className="tile-grid">
      {tiles.map((tile) => (
        <button
          key={tile.id}
          className={tile.active ? 'tile active' : 'tile'}
          onClick={() => onToggle(tile.id, !tile.active)}
        >
          {tile.label}
        </button>
      ))}
    </div>
  );
}

interface TabsRowProps {
  label: string;
  options: string[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function TabsRow({ label, options, value, disabled = false, onChange }: TabsRowProps) {
  return (
    <div className={`setting-row with-column ${disabled ? 'disabled' : ''}`}>
      <span>{label}</span>
      <div className="tabs-row">
        {options.map((option) => (
          <button
            key={option}
            className={option === value ? 'tab active' : 'tab'}
            onClick={() => onChange(option)}
            disabled={disabled}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function SecondaryActionLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button className="secondary-link" onClick={onClick}>
      {label}
    </button>
  );
}

interface ActionRowProps {
  label: string;
  buttonLabel: string;
  onAction: () => void;
}

function ActionRow({ label, buttonLabel, onAction }: ActionRowProps) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <button className="setting-action-button" onClick={onAction}>
        {buttonLabel}
      </button>
    </div>
  );
}

interface StepperRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}

function StepperRow({
  label,
  value,
  min,
  max,
  unit,
  onChange
}: StepperRowProps) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <div className="stepper-control">
        <button onClick={() => onChange(clamp(value - 1, min, max))}>-</button>
        <span>
          {value}
          {unit}
        </span>
        <button onClick={() => onChange(clamp(value + 1, min, max))}>+</button>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <strong className="setting-status-value">{value}</strong>
    </div>
  );
}

interface AppPaneProps {
  appName: string;
  onBackToMap: () => void;
}

function AppPane({ appName, onBackToMap }: AppPaneProps) {
  const appTile = APP_TILES.find((tile) => tile.label === appName);
  const appKey = appName.trim().toLowerCase();
  const fallbackIcons: Partial<Record<string, LucideIcon>> = {
    phone: Phone,
    bluetooth: Bluetooth,
    arcade: Gamepad2
  };
  const AppIcon = appTile?.icon ?? fallbackIcons[appKey];

  return (
    <section className={`app-pane dock-app-pane app-${appKey}`}>
      <header className="dock-app-header">
        <div className="app-pane-content">
          {(appTile?.iconSrc || AppIcon) && (
            <div className="app-pane-icon-wrap">
              {appTile?.iconSrc ? (
                <img src={appTile.iconSrc} alt={appName} className="app-pane-icon" />
              ) : AppIcon ? (
                <AppIcon className="app-pane-icon-svg" size={34} />
              ) : null}
            </div>
          )}
          <div>
            <h2>{appName}</h2>
            <p>{appName} panel</p>
          </div>
        </div>
        <button className="dock-app-back" onClick={onBackToMap}>
          Back to Map
        </button>
      </header>

      <div className="dock-app-content">
        {appKey === 'phone' && (
          <div className="dock-app-grid two-col">
            <section className="dock-app-card">
              <h3>Recent Calls</h3>
              <ul>
                <li>Alex Kim • 2 min ago</li>
                <li>Service Center • Yesterday</li>
                <li>Home • Yesterday</li>
              </ul>
            </section>
            <section className="dock-app-card">
              <h3>Dial Pad</h3>
              <div className="dock-keypad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                  <button key={digit}>{digit}</button>
                ))}
              </div>
            </section>
          </div>
        )}

        {appKey === 'calendar' && (
          <div className="dock-app-grid">
            <section className="dock-app-card">
              <h3>Today</h3>
              <ul>
                <li>10:30 AM • Design Review</li>
                <li>01:00 PM • Charging Stop</li>
                <li>05:45 PM • Head to Tesla HQ</li>
              </ul>
            </section>
          </div>
        )}

        {appKey === 'bluetooth' && (
          <div className="dock-app-grid two-col">
            <section className="dock-app-card">
              <h3>Paired Devices</h3>
              <ul>
                <li>iPhone 15 Pro • Connected</li>
                <li>AirPods Pro • Available</li>
                <li>Passenger Phone • Available</li>
              </ul>
            </section>
            <section className="dock-app-card">
              <h3>Settings</h3>
              <div className="dock-chip-row">
                <button>Phone Key On</button>
                <button>Auto Connect</button>
                <button>Discoverable</button>
              </div>
            </section>
          </div>
        )}

        {appKey === 'spotify' && (
          <div className="dock-app-grid">
            <section className="dock-app-card">
              <h3>Now Playing</h3>
              <p>A PERFECT WORLD</p>
              <p>The Kid LAROI</p>
              <div className="dock-progress">
                <span style={{ width: '34%' }} />
              </div>
            </section>
          </div>
        )}

        {appKey === 'toybox' && (
          <div className="dock-app-grid">
            <section className="dock-app-card">
              <h3>Toybox</h3>
              <div className="dock-chip-row">
                <button>Rainbow Road</button>
                <button>Boombox</button>
                <button>Light Show</button>
                <button>Mars Theme</button>
              </div>
            </section>
          </div>
        )}

        {appKey === 'arcade' && (
          <div className="dock-app-grid">
            <section className="dock-app-card">
              <h3>Arcade</h3>
              <div className="dock-chip-row">
                <button>Beach Buggy</button>
                <button>Sky Force</button>
                <button>Chess</button>
              </div>
            </section>
          </div>
        )}

        {!['phone', 'calendar', 'bluetooth', 'spotify', 'toybox', 'arcade'].includes(appKey) && (
          <div className="dock-app-grid">
            <section className="dock-app-card">
              <h3>{appName}</h3>
              <p>App view mapped from dock shortcut.</p>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

interface OverlayLayerProps {
  overlay: OverlayState;
  searchDraft: string;
  quickToggles: Record<string, boolean>;
  onCloseAll: () => void;
  onSearchDraftChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  onSearchMic: () => void;
  onQuickToggle: (label: string) => void;
  onSelectApp: (app: AppTile) => void;
}

function OverlayLayer({
  overlay,
  searchDraft,
  quickToggles,
  onCloseAll,
  onSearchDraftChange,
  onSearchSubmit,
  onSearchMic,
  onQuickToggle,
  onSelectApp
}: OverlayLayerProps) {
  return (
    <div className="overlay-layer">
      {overlay.isLauncherOpen && (
        <>
          <button className="overlay-backdrop" onClick={onCloseAll} aria-label="close overlay" />
          <AppLauncherModal
            quickToggles={quickToggles}
            onQuickToggle={onQuickToggle}
            onSelectApp={onSelectApp}
            onClose={onCloseAll}
          />
        </>
      )}

      {overlay.isKeyboardOpen && (
        <>
          <button className="overlay-backdrop" onClick={onCloseAll} aria-label="close overlay" />
          <OnScreenKeyboard
            value={searchDraft}
            onChange={onSearchDraftChange}
            onClose={onCloseAll}
            onSubmit={onSearchSubmit}
            onMic={onSearchMic}
          />
        </>
      )}
    </div>
  );
}

interface AppLauncherModalProps {
  quickToggles: Record<string, boolean>;
  onQuickToggle: (label: string) => void;
  onSelectApp: (app: AppTile) => void;
  onClose: () => void;
}

function AppLauncherModal({
  quickToggles,
  onQuickToggle,
  onSelectApp,
  onClose
}: AppLauncherModalProps) {
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragRef = useRef<{ startY: number } | null>(null);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return;
    }
    setDragOffsetY(clamp(event.clientY - dragRef.current.startY, 0, 180));
  };

  const endDrag = () => {
    if (dragOffsetY > 84) {
      onClose();
    }
    dragRef.current = null;
    setDragOffsetY(0);
  };

  return (
    <section
      className="app-launcher-modal"
      onClick={(event) => event.stopPropagation()}
      style={{ transform: `translate(-50%, calc(-50% + ${dragOffsetY}px))` }}
    >
      <div
        className="overlay-drag-handle"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      <div className="quick-toggle-row">
        {Object.entries(quickToggles).map(([label, enabled]) => {
          const QuickToggleIcon = QUICK_TOGGLE_ICONS[label] ?? Disc3;
          return (
            <button
              key={label}
              className={enabled ? 'quick-toggle active' : 'quick-toggle'}
              onClick={() => onQuickToggle(label)}
            >
              <span className="quick-toggle-glyph">
                <QuickToggleIcon size={15} />
              </span>
              <span className="quick-toggle-label">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="launcher-divider" />

      <div className="app-grid">
        {APP_TILES.map((app) => {
          const AppIcon = app.icon;
          return (
            <button key={app.id} className="app-tile" onClick={() => onSelectApp(app)}>
              <span className="app-tile-glyph">
                {app.iconSrc ? <img src={app.iconSrc} alt={app.label} /> : null}
                {!app.iconSrc && AppIcon ? <AppIcon className="app-tile-icon-svg" size={16} /> : null}
                {!app.iconSrc && !AppIcon ? app.glyph : null}
              </span>
              <span>{app.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface OnScreenKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onClose: () => void;
  onMic: () => void;
}

function OnScreenKeyboard({ value, onChange, onSubmit, onClose, onMic }: OnScreenKeyboardProps) {
  const [isShift, setIsShift] = useState(false);
  const [symbolMode, setSymbolMode] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragRef = useRef<{ startY: number } | null>(null);

  const rows = symbolMode
    ? [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
        ['-', '_', '=', '+', '/', '?', ';', ':', ',', '.']
      ]
    : [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
      ];
  const numberPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const commitKey = (key: string) => {
    const content = isShift ? key.toUpperCase() : key;
    onChange(`${value}${content}`);
    if (isShift && !symbolMode) {
      setIsShift(false);
    }
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return;
    }
    setDragOffsetY(clamp(event.clientY - dragRef.current.startY, 0, 220));
  };

  const endDrag = () => {
    if (dragOffsetY > 100) {
      onClose();
    }
    dragRef.current = null;
    setDragOffsetY(0);
  };

  return (
    <section className="on-screen-keyboard" style={{ transform: `translateY(${dragOffsetY}px)` }}>
      <div
        className="overlay-drag-handle"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      <div className="keyboard-preview">{value || 'Navigate...'}</div>
      <div className="keyboard-shell">
        <div className="keyboard-main">
          <div className="keyboard-row">
            {rows[0].map((key) => (
              <button key={key} className="key" onClick={() => commitKey(key)}>
                {isShift ? key.toUpperCase() : key}
              </button>
            ))}
            <button
              className="key key-action"
              onClick={() => onChange(value.slice(0, Math.max(value.length - 1, 0)))}
            >
              BKSP
            </button>
          </div>

          <div className="keyboard-row">
            {rows[1].map((key) => (
              <button key={key} className="key" onClick={() => commitKey(key)}>
                {isShift ? key.toUpperCase() : key}
              </button>
            ))}
            <button className="key key-action" onClick={() => onSubmit(value)}>
              ENTER
            </button>
          </div>

          <div className="keyboard-row">
            {!symbolMode && (
              <button className="key key-wide" onClick={() => setIsShift((prev) => !prev)}>
                SHIFT
              </button>
            )}
            {rows[2].map((key) => (
              <button key={key} className="key" onClick={() => commitKey(key)}>
                {isShift ? key.toUpperCase() : key}
              </button>
            ))}
          </div>

          <div className="keyboard-row keyboard-row-bottom">
            <button className="key key-wide" onClick={onMic}>
              MIC
            </button>
            <button className="key key-wide" onClick={() => setSymbolMode((prev) => !prev)}>
              {symbolMode ? 'ABC' : '? # &'}
            </button>
            <button className="key key-space" onClick={() => onChange(`${value} `)}>
              SPACE
            </button>
            <button className="key key-wide" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </div>

        <div className="keyboard-number-pad">
          {numberPad.map((key) => (
            <button key={key} className="key key-number" onClick={() => onChange(`${value}${key}`)}>
              {key}
            </button>
          ))}
          <button className="key key-number key-zero" onClick={() => onChange(`${value}0`)}>
            0
          </button>
        </div>
      </div>
    </section>
  );
}

export default App;
