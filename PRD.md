# PRD

---

## 1) 이미지 기반 화면/상태(Scenes) 분석

첨부 이미지에서 관찰되는 주요 화면 상태는 아래 6가지로 정리됩니다.

1. **기본 주행 화면 (지도 + 좌측 차량 영역 + 하단 도크)**

   * 우측: 지도(Map) + 상단 “Navigate” 검색 바 + 지도 컨트롤 스택
   * 좌측: 간단한 차량 탑뷰/주행 비주얼(상황에 따라 바뀜)
   * 하단: 고정 도크(온도/앱 숏컷/볼륨)
   * 좌하단: **미디어 미니플레이어 카드**(접힌 상태)

2. **키보드 오버레이(검색 입력 상태)**

   * 지도 위로 **온스크린 키보드**가 슬라이드업
   * QWERTY + 숫자패드 + 음성(마이크) + Enter/Backspace

3. **메인 메뉴(차량 3D 크게 + 하단 카드 2개)**

   * 지도 대신 **차량 3D 뷰가 메인**
   * 하단에 **미디어 카드 + 내비 검색 카드(Home/Work)** 2열
   * 가운데에 카드 페이지 도트(캐러셀 인디케이터)

4. **런처/퀵 컨트롤 오버레이(모달)**

   * 중앙에 반투명 다크 패널
   * 상단: Front/Rear Defrost, Seat, Heated Steering, Wipers 등 **퀵 토글**
   * 하단: Dashcam/Calendar/Messages/Zoom/Theater/Toybox/Spotify… **앱 그리드**

5. **설정(Settings) 패널 화면**

   * 우측: **설정 패널**(좌측 카테고리 네비 + 우측 상세)
   * 카테고리 예: Controls, Pedals & Steering, Charging, Autopilot…
   * 상세는 토글/세그먼트/슬라이더/타일 그리드 등 다양한 폼 팩터

6. **내비게이션 활성(경로 안내)**

   * 지도에 경로 폴리라인 + 핀
   * 상단 좌측: **턴바이턴 안내 카드**(“200 ft …” + 다음 턴 리스트)
   * 하단: **트립 요약 카드**(ETA, 거리, 배터리, End Trip, …)
   * 좌측 차량 영역은 **차선/주행 시각화(파란 라인)** + 속도/제한속도 표시

---

## 2) 구현해야 할 컴포넌트 분석 (컴포넌트 트리)

아래는 “실제 구현 시” 가장 안정적으로 확장 가능한 구조(레이아웃/오버레이/상태 분리)로 쪼갠 컴포넌트 트리입니다.

### A. App Shell / 레이아웃 계층

* **`DashboardShell` (최상위)**

  * `TopStatusBar`
  * `MainSplitPane`

    * `LeftPane` (차량/주행 영역)
    * `RightPane` (지도/설정/앱)
  * `BottomDock`
  * `OverlayLayer` (모달/키보드/토스트 등)

---

### B. Top 영역

* **`TopStatusBar`**

  * `GearIndicator` (PRND)
  * `BatteryIndicator` (90% + 배터리 아이콘)
  * `CenterStatusGroup`

    * `LockStatusIcon`
    * `Clock` (10:21 AM)
    * `OutsideTemp` (65°F)
    * `DriverProfile` (Name / Easy Entry)
  * `PassengerAirbagIndicator` (“PASSENGER AIRBAG OFF”)

> 포인트: 좌측 패널(화이트) + 우측 패널(지도 위 오버레이)처럼 보이므로, 구현은 “전체 고정 바”로 두고 **배경/투명 처리만 패널별로 다르게** 적용하는 편이 유지보수에 좋습니다.

---

### C. Bottom Dock (항상 고정)

* **`BottomDock`**

  * `AppLauncherButton` (차 아이콘 → 런처 오픈)
  * `DriverClimateControl` (온도 + 좌/우 화살표)
  * `DockAppShortcuts` (전화/블루투스/Spotify 등 아이콘)
  * `PassengerClimateControl`
  * `VolumeControl` (스피커 아이콘 + 조절 화살표)

---

### D. Left Pane (차량/주행 시각화 + 상태 아이콘)

* **`LeftPane`**

  * `VehicleStatusIconStack` (좌측 세로 아이콘)

    * `LightIndicator` (녹색 On)
    * `AutoHighBeamIndicator` (회색 Off)
    * `FogLightIndicator` (녹색 On)
    * `SeatbeltWarningIndicator` (빨강)
  * `DrivingVisualization`

    * 모드1: `VehicleTopDownView` (차량 탑뷰 + 센서 아크)
    * 모드2: `LaneAssistView` (차선/앞차 + 파란 라인)
    * 모드3: `Vehicle3DView` (큰 3D 차량)

      * `VehicleHotspotLabel` (“Open Frunk”, “Open Trunk”, “Trunk Open”)
      * `CentralLockIcon` (차량 위 잠금 아이콘)
      * `ChargePortIndicator` (번개)
  * `SpeedCluster` (내비 활성 시)

    * `CurrentSpeed` (29 MPH)
    * `SpeedLimitBadge` (SPEED LIMIT 80)
  * `LeftBottomCardsArea`

    * `MediaMiniPlayerCard` (항상/상황별 표시)

---

### E. Right Pane (지도 / 내비 / 설정)

#### 1) 지도 기본

* **`MapPane`**

  * `MapSearchBar` (“Navigate”)
  * `MapCanvas` (지도 렌더링 컨테이너)
  * `MapControlStack`

    * `MapStyleButton` (지구본)
    * `TrafficButton` (신호등)
    * `PinButton` (핀)
    * `ChargingButton` (번개)
  * `CompassButton` (N)

#### 2) 내비게이션 활성

* `NavigationOverlay`

  * `TurnByTurnCard`

    * `PrimaryManeuver` (큰 화살표 + “200 ft” + 도로명)
    * `UpcomingManeuversList` (다음 턴 + 거리)
  * `TripSummaryCard`

    * `ETA + Destination`
    * `Distance + BatteryAtArrival`
    * `EndTripButton`
    * `MoreMenuButton (…)`
  * (선택) `RoutePolylineLayer`, `POIMarkersLayer`

#### 3) 설정 패널

* **`SettingsPane`**

  * `SettingsSidebar`

    * `SettingsSearchInput`
    * `SettingsCategoryList`

      * `CategoryItem` (Controls, Pedals & Steering, …)
  * `SettingsHeader`

    * `DriverProfileChip` (Easy Entry)
    * `HeaderActionIcons` (다운로드/알림/블루투스/네트워크 등)
  * `SettingsContent`

    * 공통 UI 프리미티브:

      * `SettingGroupHeader` (+ info 아이콘)
      * `ToggleRow`
      * `SegmentedControlRow` (Chill/Standard 등)
      * `SliderRow` (밝기)
      * `TileGrid` (Fold Mirrors/Glovebox…)
      * `ActionTile` (Auto High Beam 같은 단일 큰 타일)
      * `CheckboxRow`
      * `Tabs` (Tab1/Tab2)
      * `SecondaryActionLink` (“Display” 같은 우측 링크)
    * 스크롤: `SettingsScrollContainer`

---

### F. Overlay Layer (모달/키보드/런처)

* **`OverlayLayer`** (z-index 관리용 단일 진입점)

  * `AppLauncherModal`

    * `QuickToggleRow` (Defrost/Seat/Wipers…)
    * `AppGrid`

      * `AppIconTile` (Dashcam, Calendar, …)
  * `OnScreenKeyboard`

    * `KeyboardLayout` (QWERTY)
    * `NumberPad`
    * `VoiceInputButton`
    * `EnterKey`, `BackspaceKey`, `ShiftKey`, `SpecialCharKey`
  * (추가 권장) `Toast / Snackbar` (경고/상태)
  * (추가 권장) `ConfirmDialog` (예: 트렁크 오픈 확인)

---

## 3) 컴포넌트 “상태(State) 모델” 제안

이미지처럼 “패널+오버레이”가 겹치는 UI는 **전역 상태를 얇게** 설계하는 게 중요합니다.

* `leftPaneMode`: `TOP_DOWN | LANE_ASSIST | VEHICLE_3D`
* `rightPaneMode`: `MAP | SETTINGS | APP` (향후 Theater 등)
* `overlay`:

  * `isLauncherOpen: boolean`
  * `isKeyboardOpen: boolean`
  * `activeModal?: 'launcher' | ...`
* `navigationState`:

  * `inactive | active`
  * `currentStep`, `nextSteps[]`, `eta`, `distance`, `batteryAtArrival`
* `mediaState`:

  * `track`, `artist`, `isPlaying`, `progress`, `isFavorite`
* `settingsState`:

  * `activeCategory`
  * `values` (toggle/segment/slider)
* `vehicleStatus`:

  * `lightsOn`, `fogOn`, `autoHighBeamOn`, `seatbeltWarning`, `locked`, `trunkOpen`…

---

# 4) PRD (Product Requirements Document)

## 4.1 제품 개요

**제품명(가칭):** Car Dashboard UI Prototype (Tesla-like)
**목표:** 첨부 이미지 수준의 **대시보드 UI 구조/상호작용을 재현**하여,

* 디자인/개발 프로토타이핑
* 시뮬레이터/데모
* 인포테인먼트 UI 구성 테스트
  에 활용할 수 있는 **컴포넌트 기반 UI**를 제공한다.

> 주의: 본 PRD는 “UI 구현” 중심이며, 실제 차량 제어/안전 기능은 포함하지 않는다.

---

## 4.2 문제 정의 (Why)

* 대시보드 UI는 **상시 정보(속도/경고/미디어/내비/차량 상태)**를 한 화면에서 동시에 다뤄야 함
* 패널/오버레이가 복잡하게 겹치므로, “화면 단위”보다 **컴포넌트 단위 설계**가 필수
* 지금 필요한 것은 실차 기능이 아니라, **UI 구조/상태/인터랙션을 빠르게 검증할 수 있는 프레임**임

---

## 4.3 목표(Goals)

1. **이미지에 등장하는 6개 상태를 모두 재현** (레이아웃/전환/오버레이)
2. 핵심 상호작용 제공

   * 런처 열기/닫기
   * 설정 패널 카테고리 이동 및 값 변경(토글/세그먼트/슬라이더/타일)
   * 내비 검색 → 키보드 입력 플로우
   * 내비 활성 화면(턴바이턴/트립 카드)
   * 미디어 카드 재생/일시정지/이전/다음/즐겨찾기
3. 추후 실제 데이터 연동(차량 신호, 내비 SDK, 스트리밍)에 대비한 **상태 모델/컴포넌트 API 안정화**

---

## 4.4 비목표(Non-goals)

* 실제 차량 제어(트렁크/도어/주행 모드 변경) “기능 구현”
* 자율주행/안전 판단 로직
* 지도 SDK/내비 엔진의 완전 구현(초기에는 Mock/Stub 가능)
* 테슬라 자산(아이콘/폰트/3D 모델) 그대로의 사용 (권장: 대체 에셋)

---

## 4.5 사용자/시나리오

### 주요 사용자

* **Driver(운전자)**: 주행 중 빠르게 내비/미디어/차량 상태 확인
* **Passenger(동승자)**: 미디어 조작, 목적지 검색 보조

### 핵심 시나리오 (User Stories)

1. 운전자는 주행 화면에서 **현재 상태(아이콘/속도/지도)**를 한눈에 본다.
2. 운전자는 하단 도크의 차 아이콘으로 **런처/퀵 토글**을 열고 빠르게 기능을 실행한다.
3. 사용자는 Navigate 검색을 탭하면 **키보드**가 올라오고 목적지를 입력한다.
4. 내비가 활성화되면 지도에 경로가 표시되고, **턴바이턴 + 트립 요약**이 나타난다.
5. 사용자는 설정에서 **Pedals & Steering/Controls** 등을 변경한다(세그먼트/토글/슬라이더).
6. 사용자는 미디어 카드에서 **재생/일시정지/곡 이동/즐겨찾기**를 수행한다.

---

## 4.6 범위(Scope)

### MVP (필수)

* 레이아웃: Top/Bottom 고정 + 좌/우 분할 패널
* 화면 상태 6종 구현
* 런처 모달 + 퀵 토글 + 앱 그리드
* 설정 패널(사이드바 + 2~3개 카테고리 샘플: Controls, Pedals & Steering, Display)
* 지도 화면(지도는 placeholder 가능) + 컨트롤 스택 UI
* 내비 활성 UI(턴 카드/트립 카드/경로 폴리라인은 mock 가능)
* 키보드 오버레이(영문 기준)
* 미디어 미니플레이어 카드(기본 조작)

### V1 (확장)

* 설정 카테고리 전체 확장(Charging/Autopilot/Locks…)
* 지도 SDK 연동(Mapbox/Google 등) + 실경로/ETA
* 멀티 앱(Spotify/Theater 등) 실제 뷰 전환
* 토스트/경고 시스템, 다크모드, i18n(한글)

---

## 4.7 기능 요구사항 (Functional Requirements)

### FR-1. 공통 레이아웃/네비게이션

* **FR-1.1** TopStatusBar는 항상 표시되고, 좌/우 패널 배경 변화에도 가독성을 유지해야 한다.
* **FR-1.2** BottomDock는 항상 고정이며, 런처/설정/키보드 상태에서도 유지된다.
* **FR-1.3** LeftPane/RightPane 모드는 전역 상태로 전환 가능해야 한다.

**수용 기준(AC)**

* (AC-1) 어떤 화면 상태에서도 Top/Bottom이 밀리거나 겹치지 않는다.
* (AC-2) 오버레이가 열려도 도크는 클릭 가능/불가 정책이 명확(예: 모달 열리면 도크 비활성)해야 한다.

---

### FR-2. 런처(모달) + 퀵 토글 + 앱 그리드

* **FR-2.1** 도크의 차 아이콘을 탭하면 `AppLauncherModal`이 열린다.
* **FR-2.2** 모달은 바깥 탭 또는 닫기 제스처로 닫힌다.
* **FR-2.3** 퀵 토글은 On/Off 상태 표시(아이콘/색) 및 클릭 이벤트를 제공한다.
* **FR-2.4** 앱 타일은 클릭 시 RightPane을 `APP` 모드로 전환(또는 더미 화면 표시).

**AC**

* (AC-3) 모달은 중앙 정렬 + 배경 딤/블러 적용(이미지처럼 반투명).
* (AC-4) 토글 상태 변화가 즉시 UI에 반영된다.

---

### FR-3. 설정(Settings) 패널

* **FR-3.1** 설정 패널은 RightPane 모드로 표시되며, 사이드바 카테고리 선택 시 콘텐츠가 바뀐다.
* **FR-3.2** 설정 항목 타입: Toggle / Segmented / Slider / TileGrid / Link(“Display”) / Tabs / Checkbox 지원
* **FR-3.3** 콘텐츠는 스크롤 가능해야 한다.

**AC**

* (AC-5) 카테고리 선택 시 강조 스타일이 바뀌고, 콘텐츠 영역이 즉시 갱신된다.
* (AC-6) 세그먼트 선택/토글/슬라이더가 값 변경 이벤트를 방출한다.

---

### FR-4. 지도/내비 UI

* **FR-4.1** MapPane에는 Navigate 검색 바와 지도 컨트롤 스택이 존재해야 한다.
* **FR-4.2** 내비 활성 시 `TurnByTurnCard`와 `TripSummaryCard`가 표시된다.
* **FR-4.3** 경로 폴리라인/핀은 mock 데이터로도 표시 가능해야 한다.

**AC**

* (AC-7) 내비 활성 시 상단 턴 카드와 하단 트립 카드가 지도 위에 겹쳐 표시된다.
* (AC-8) End Trip 클릭 시 내비 상태가 inactive로 바뀌고 카드가 사라진다.

---

### FR-5. 검색 키보드

* **FR-5.1** Navigate 검색바 탭 → 키보드 오버레이가 슬라이드업 된다.
* **FR-5.2** Enter 시 입력값 이벤트를 발생(목적지 검색 트리거).
* **FR-5.3** 음성 버튼(마이크)은 이벤트 훅 제공(실제 음성인식은 비범위 가능)

**AC**

* (AC-9) 키보드가 올라오면 지도/패널이 가려지되, 상단 상태바/도크 레이아웃은 유지된다.

---

### FR-6. 미디어 카드

* **FR-6.1** 미디어 미니 카드: 곡 정보, 진행바, 재생/일시정지/이전/다음, 즐겨찾기
* **FR-6.2** 재생 상태에 따라 아이콘 변경
* **FR-6.3** 카드 크기(접힘/확장) 변형을 지원(이미지의 2가지 레이아웃)

**AC**

* (AC-10) 재생 버튼 탭 시 isPlaying 토글 및 아이콘 즉시 반영.

---

## 4.8 비기능 요구사항 (Non-functional)

* **성능**: 화면 전환/모달 오픈/슬라이더 드래그 시 프레임 드랍 최소화(목표 60fps)
* **터치 타겟**: 최소 44px 이상
* **시인성**: 주행 중 한눈에 읽히는 폰트 크기/대비 유지
* **확장성**: 카테고리/앱 추가 시 기존 컴포넌트 변경 최소화(데이터 드리븐 렌더링)
* **테마**: 라이트 기본(이미지 기반) + 다크 확장 가능 구조
* **국제화(i18n)**: 문자열 리소스 분리(영/한)

---

## 4.9 데이터/인터페이스(권장) 정의

### 예시 모델 (요약)

* `VehicleStatus`:

  * `locked`, `frunkOpen`, `trunkOpen`, `seatbeltWarning`, `lightsMode`, `fogOn`, `autoHighBeamOn`
* `NavigationModel`:

  * `active`, `currentStep`, `nextSteps[]`, `eta`, `distance`, `batteryAtArrival`, `routePolyline`
* `MediaModel`:

  * `trackTitle`, `artist`, `albumArtUrl`, `progress`, `duration`, `isPlaying`, `isFavorite`
* `SettingsModel`:

  * `activeCategory`, `values: Record<settingId, value>`

---

## 4.10 분석/지표(Success Metrics)

(UI 프로토타입이라도 “완성도”를 측정할 지표가 있으면 좋습니다)

* 화면 전환 평균 응답 시간(탭→UI 반영) < 100ms
* 모달/키보드 오픈 애니메이션 끊김(드랍 프레임) 0~최소
* 사용성 테스트에서 “목적지 입력→내비 시작” 경로 성공률 90%+
* 설정에서 값 변경 성공률 95%+ (토글/세그먼트/슬라이더)

---

## 4.11 QA 체크리스트(핵심)

1. 오버레이 우선순위: `Keyboard` > `LauncherModal` > `SettingsPane` > 기본 화면
2. 오버레이 열린 상태에서 뒤 배경 스크롤/클릭 방지 여부 정책 확인
3. 세그먼트/슬라이더/토글의 포커스/상태 스타일 정상 여부
4. 다양한 텍스트 길이(한글/긴 도로명)에서 레이아웃 깨짐 여부
5. 터치 영역(특히 도크 아이콘, 지도 컨트롤 버튼) 미스 탭 발생 여부

---

# 5) “최소 구현(MVP)”에 필요한 컴포넌트 체크리스트

아래만 만들면, 첨부 이미지 수준의 데모를 거의 그대로 구성할 수 있습니다.

* Shell: `DashboardShell`, `TopStatusBar`, `BottomDock`, `MainSplitPane`, `OverlayLayer`
* Left: `VehicleStatusIconStack`, `DrivingVisualization(3 modes)`, `SpeedCluster`, `MediaMiniPlayerCard`
* Right: `MapPane`, `MapSearchBar`, `MapControlStack`, `NavigationOverlay(턴/트립 카드)`
* Settings: `SettingsPane`, `SettingsSidebar`, `SettingsContent`, (Toggle/Segment/Slider/TileGrid)
* Overlays: `AppLauncherModal(QuickToggleRow + AppGrid)`, `OnScreenKeyboard`

---