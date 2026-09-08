<div align="center">
  <a href="https://chromewebstore.google.com/detail/roedex/fgdehjebfkbdefdnenpgjejjnhlkchjh" target="_blank">
    <img src="public/logo.png" alt="ROEDEX 로고" width="136" style="filter: drop-shadow(0 0 24px rgba(251, 146, 60, 0.45));" />
  </a>
  
  <h1 align="center" style="font-size: 2.2rem; font-weight: 900; letter-spacing: 2px;">⚡ ROEDEX 컴패니언 툴</h1>
  
  <p align="center"><b>Roots of Embervault를 위한 궁극의 실시간 전술 오버레이 및 트래커 수트</b></p>
  <p align="center"><i>60 FPS 프레임 동기화 엔진 • 서브-밀리초 패킷 분석기 • 100% 클라이언트 사이드 및 안티치트 준수</i></p>

  <p align="center">
    <a href="README.md"><b>🇺🇸 English</b></a> &nbsp;•&nbsp; 
    <a href="README.es.md"><b>🇪🇸 Español</b></a> &nbsp;•&nbsp; 
    <a href="README.ru.md"><b>🇷🇺 Русский</b></a> &nbsp;•&nbsp; 
    <a href="README.ko.md"><b>🇰🇷 한국어</b></a>
  </p>

  <p align="center">
    <a href="https://chromewebstore.google.com/detail/roedex/fgdehjebfkbdefdnenpgjejjnhlkchjh" target="_blank">
      <img src="https://img.shields.io/badge/Chrome_%EC%9B%B9_%EC%8A%A4%ED%86%A0%EC%96%B4-v0.0.5-22d3ee?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome 웹 스토어" />
    </a>
    <img src="https://img.shields.io/badge/%EB%B2%84%EC%A0%84-v0.0.5_%EC%95%88%EC%A0%95%ED%8C%90-3b82f6?style=for-the-badge&logo=github&logoColor=white" alt="버전 0.0.5" />
    <img src="https://img.shields.io/badge/%EC%97%94%EC%A7%84-60_FPS_%EB%8F%99%EA%B8%B0%ED%99%94-8b5cf6?style=for-the-badge&logo=speedtest&logoColor=white" alt="60 FPS" />
    <img src="https://img.shields.io/badge/%EB%B3%B4%EC%95%88-%EC%95%88%ED%8B%B0%EC%B9%98%ED%8A%B8_%EC%95%88%EC%A0%84-10b981?style=for-the-badge&logo=shield&logoColor=white" alt="안티치트 안전" />
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.7" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
    <img src="https://img.shields.io/badge/Vite-6.4-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
    <img src="https://img.shields.io/badge/%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4-MIT-10b981?style=flat-square" alt="MIT 라이선스" />
  </p>

  <p align="center">
    <a href="#-핵심-기능"><b>🌟 핵심 기능</b></a> &nbsp;•&nbsp; 
    <a href="#-v005-신규-업데이트-내용"><b>📢 신규 내용</b></a> &nbsp;•&nbsp; 
    <a href="#-엔진-성능--벤치마크"><b>⚡ 벤치마크</b></a> &nbsp;•&nbsp; 
    <a href="#-단축키-안내"><b>🎮 단축키</b></a> &nbsp;•&nbsp; 
    <a href="#️-설치-가이드"><b>🛠️ 설치</b></a> &nbsp;•&nbsp; 
    <a href="#-크레딧-및-감사-인사"><b>🏆 크레딧</b></a>
  </p>
</div>

> [!IMPORTANT]
> **커뮤니티 프로젝트 고지 사항 및 기여:**  
> ROEDEX는 독립적인 커뮤니티 운영 도구이며, **Ruyui Studios**에 의해 검증(감사)되거나 공식적으로 보증되지 **않습니다**.  
> 고급 지도 기능 및 좌표 추적기는 *Roots of Embervault*의 공동 설립자인 **Voxel Queen**이 제공한 원본 지도 데이터를 기반으로 작동합니다.

---

## 📖 목차
1. [🌟 개요](#-개요)
2. [✨ 핵심 기능](#-핵심-기능)
3. [⚡ 엔진 성능 & 벤치마크](#-엔진-성능--벤치마크)
4. [📢 v0.0.5 신규 업데이트 내용](#-v005-신규-업데이트-내용)
5. [🎮 단축키 안내](#-단축키-안내)
6. [🔒 보안 및 개인정보 보호](#-보안-및-개인정보-보호)
7. [🛠️ 설치 가이드](#️-설치-가이드)
8. [🏆 크레딧 및 감사 인사](#-크레딧-및-감사-인사)
9. [🤝 후원 및 기여 방법](#-후원-및-기여-방법)

---

## 🌟 개요

**ROEDEX**는 *Roots of Embervault* 플레이어를 위한 프리미엄 비침습적 클라이언트 사이드 오버레이 확장 프로그램입니다. 백그라운드에서 실시간 WebSocket 패킷을 안전하게 분석하여 게임 내 실시간 통계, 리스폰 타이머, 전리품 기록, AI 컴패니언 등 유용한 정보들을 제공합니다.

**Manifest V3**, **React**, **Tailwind CSS**로 구축되었으며, AAA 게임 대시보드와 같은 프리미엄 디자인의 **글래스모피즘(Glassmorphism) UI**를 선사합니다.

---

## ✨ 핵심 기능

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🗺️ 전술 레이더 & 동적 미니맵</h3>
      <p>DOM 렉이 전혀 없는 실시간 오프스크린 캔버스 렌더링. 전용 A* 웹 워커, 사망 시 드랍 위치 자동 복구 라우터 및 전 구역 실시간 리스폰 카운트다운 탑재.</p>
      <p>
        <img src="https://img.shields.io/badge/엔진-오프스크린_캔버스-8b5cf6?style=flat-square" />
        <img src="https://img.shields.io/badge/A*-웹_워커-3b82f6?style=flat-square" />
        <img src="https://img.shields.io/badge/O(1)-공간_해시-10b981?style=flat-square" />
      </p>
    </td>
    <td width="50%" valign="top">
      <h3>🏪 실시간 거래소 & 바자르 인텔리전스</h3>
      <p>실시간 매물 오더북, 가격 스파크라인 차트, 바자르 그리드 뷰 및 HUD에서 즉시 확인하는 시간당 수익 텔레메트리 (XP/hr, 룬스톤/hr, 골드/hr) 제공.</p>
      <p>
        <img src="https://img.shields.io/badge/데이터-가격_스파크라인-f59e0b?style=flat-square" />
        <img src="https://img.shields.io/badge/실시간-오더북-06b6d4?style=flat-square" />
        <img src="https://img.shields.io/badge/텔레메트리-XP%2F골드_HUD-ec4899?style=flat-square" />
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>⚔️ 전투 HUD & 장비 내구도 텔레메트리</h3>
      <p>실시간 무기 및 방어구 내구도 모니터, 대상 고정 체력바, 저체력 화면 펄스 경고. 희귀 장비의 예상치 못한 파손을 사전에 방지합니다.</p>
      <p>
        <img src="https://img.shields.io/badge/알림-내구도_경고-ef4444?style=flat-square" />
        <img src="https://img.shields.io/badge/HUD-대상_고정-3b82f6?style=flat-square" />
        <img src="https://img.shields.io/badge/펄스-저체력_글로우-f43f5e?style=flat-square" />
      </p>
    </td>
    <td width="50%" valign="top">
      <h3>🤖 대화형 AI 컴패니언</h3>
      <p>전투 및 희귀 전리품 획득 시 상황에 맞춰 반응하는 CRT 얼굴 표정 애니메이션을 갖춘 4명의 개성 넘치는 캐릭터 (<b>밥</b>, <b>카야</b>, <b>리아</b>, <b>크래쉬</b>).</p>
      <p>
        <img src="https://img.shields.io/badge/캐릭터-4명_고유-a855f7?style=flat-square" />
        <img src="https://img.shields.io/badge/애니메이션-CRT_표정-14b8a6?style=flat-square" />
        <img src="https://img.shields.io/badge/상태-이벤트_반응-6366f1?style=flat-square" />
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔍 글로벌 즉각 데이터베이스 검색</h3>
      <p>게임을 중단하지 않고 엠버볼트 내 모든 NPC, 드랍 테이블, 자원 노드, 퀘스트를 즉시 퍼지 검색할 수 있는 단축키 모달 (<code>Ctrl + Shift + F</code>).</p>
      <p>
        <img src="https://img.shields.io/badge/단축키-Ctrl+Shift+F-64748b?style=flat-square" />
        <img src="https://img.shields.io/badge/검색-DB_LOOKUP-10b981?style=flat-square" />
        <img src="https://img.shields.io/badge/속도-%3C5ms-22c55e?style=flat-square" />
      </p>
    </td>
    <td width="50%" valign="top">
      <h3>🎨 옵시디언 글래스모피즘 아키텍처</h3>
      <p>8방향 크기 조절, 레이아웃 전환 (세로 열 / 가로 행) 및 정확한 화면 좌표를 기억하는 독립 분리형 팝업 창을 지원하는 유연한 플로팅 UI.</p>
      <p>
        <img src="https://img.shields.io/badge/UI-글래스모피즘-f59e0b?style=flat-square" />
        <img src="https://img.shields.io/badge/크기조절-8방향-8b5cf6?style=flat-square" />
        <img src="https://img.shields.io/badge/창-독립분리형-06b6d4?style=flat-square" />
      </p>
    </td>
  </tr>
</table>

---

## ⚡ 엔진 성능 & 벤치마크

ROEDEX는 AAA 게임 성능 기준에 맞춰 제작되었습니다. 게임 화면에 전혀 부하를 주지 않는 완전한 독립 관전자 모드로 실행됩니다:

| 메트릭 / 서브시스템 | 벤치마크 | 엔지니어링 구현 내용 |
| :--- | :---: | :--- |
| **FPS 안정성** | **완벽한 60 FPS** | `RafScheduler.ts`가 모든 창의 상태 업데이트를 단일 프레임 루프에 동기화 |
| **메모리 점유율** | **< 45 MB** | 오프스크린 캔버스 렌더링 + 30일 경과 로그 자동 삭제 |
| **패킷 지연 시간** | **< 1 ms** | `world: MAIN` WebSocket 관전자 컨텍스트에서 직접 실행 |
| **길찾기 속도** | **< 3 ms / 쿼리** | 전용 웹 워커 내에 완전히 격리된 MinHeap 기반 A* 알고리즘 |
| **번들 아키텍처** | **500 kB 미만 청크** | 정교한 서드파티 모듈 분리 (`vendor_charts`, `vendor_motion`, `vendor_db`) |
| **데이터 보안** | **100% 로컬 저장** | 외부 서버 전송 일절 없음; 5초 디바운스 배치를 지원하는 IndexedDB |

---

## 📢 v0.0.5 신규 업데이트 내용

*   🔔 **업데이트 알림 배너:** ROEDEX 업데이트 시 세련된 글래스모피즘 배너가 나타나며 변경 로그로 바로 이동할 수 있습니다.
*   🏪 **거래소 및 경제 허브:** 실시간 아이템 시세, 스파크라인 차트, 바자르 뷰 및 시장 동향 분석 탭.
*   📊 **프로필 및 일일 대시보드:** 일일 게임 통계 요약, 전투 기록 및 누적 세션 데이터 분석.
*   🔍 **글로벌 통합 검색:** 단축키를 통해 NPC, 자원, 퀘스트, 드랍 아이템을 즉시 검색.
*   ⚡ **60 FPS 고성능 엔진:** 번들 용량 50% 이상 절감, 오프스크린 캔버스 렌더링 및 RAF 동기화 루프.
*   🗺️ **동적 경로 안내:** 웹 워커 기반의 다중 구역 길찾기 및 사망 시 드랍 위치 자동 경로 설정.
*   ❤️ **대상 및 플레이어 체력바:** 저체력 경고 및 커스텀 스타일을 지원하는 독립형 HUD 체력바.
*   🛡️ **안정화된 데이터 저장소:** 디바운스 배치 처리 및 비상 저장을 지원하는 통합 IndexedDB 시스템.

---

## 🎮 단축키 안내

모든 단축키는 **설정 → 조작(Controls)** 탭에서 원하시는 대로 변경하실 수 있습니다:

| 액션 | 기본 단축키 | 상세 설명 |
| :--- | :---: | :--- |
| **글로벌 즉각 검색** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | NPC, 보스, 자원, 전리품 데이터베이스 즉시 검색. |
| **HUD 최소화 / 최대화** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> | ROEDEX UI 전체를 작은 플로팅 오브로 최소화하거나 복구. |
| **레이아웃 모드 전환** | <kbd>Shift</kbd> + <kbd>H</kbd> | 세로 사이드바와 가로 배너 형태를 즉시 전환. |
| **오버레이 위치 초기화** | <kbd>Shift</kbd> + <kbd>R</kbd> | 모든 창의 크기와 위치를 최적의 기본값으로 재설정. |
| **UI 잠금 / 클릭 스루** | <kbd>Shift</kbd> + <kbd>U</kbd> | 창 위치를 잠그고 마우스 클릭을 게임 화면에 바로 전달. |

---

## 🔒 보안 및 개인정보 보호

사용자의 개인정보는 항상 안전하게 지켜져야 합니다. **ROEDEX는 어떠한 사용자 정보도 수집하지 않습니다.**

*   **100% 로컬 작동:** 사용자의 설정 정보, 전리품 기록, 레이아웃 등 모든 데이터는 IndexedDB와 localStorage를 통해 오직 사용자의 기기에만 저장됩니다.
*   **게임 내 스크립트 비삽입:** ROEDEX는 게임 클라이언트를 직접 수정하거나 조작하지 않아 안티 치트 시스템으로부터 안전합니다.
*   **수동적 패킷 감지:** 확장 프로그램은 웹소켓 트래픽을 읽어 데이터를 표기할 뿐, 매크로를 실행하거나 조작을 자동화하지 않습니다.
*   **제한된 권한 설정:** 오직 공식 게임 도메인에 대해서만 작동 권한을 요청합니다.

더 자세한 내용은 [개인정보 처리방침](PRIVACY_POLICY.md)에서 확인하세요.

---

## 🛠️ 설치 가이드

### 방법 A: 웹 스토어 설치 (권장)
1. Chrome 웹 스토어의 **ROEDEX** 공식 페이지를 방문합니다.
2. **Chrome에 추가** 버튼을 클릭합니다.
3. 브라우저 툴바에서 확장 프로그램 아이콘을 고정합니다.
4. 게임을 실행하면 자동으로 ROEDEX가 감지되어 작동합니다!

### 방법 B: 개발자 모드 설치 (직접 빌드)
1. 리포지토리를 복사합니다:
   ```bash
   git clone https://github.com/LordCyberr/ROEDEX.git
   ```
2. 디렉토리로 이동하여 필요한 패키지를 설치합니다:
   ```bash
   npm install
   ```
3. 빌드를 실행합니다:
   ```bash
   npm run build
   ```
4. 크롬 브라우저를 열고 `chrome://extensions/` 주소로 이동합니다.
5. 우측 상단의 **개발자 모드**를 활성화합니다.
6. **압축해제된 확장 프로그램을 로드** 버튼을 누른 후, 생성된 `dist` 폴더를 선택합니다.

---

## 🏆 크레딧 및 감사 인사

ROEDEX는 커뮤니티의 지속적인 도움과 게임 개발진의 소중한 협력으로 탄생할 수 있었습니다:

*   👑 **Lord Cyberr** – 메인 개발자 및 프로젝트 총괄
*   🛠️ **MrSnorch** – 프로젝트 기여, 멘토링 및 초기 아키텍처 가이드 제공
*   💎 **Voxel Queen** – *Roots of Embervault*의 공동 설립자 — 아낌없는 조언, 통화 소통 및 원본 맵 데이터 협조에 감사드립니다.
*   🎮 **Ruyui Studios** – *Roots of Embervault* 개발사 (참고: ROEDEX는 독립 프로젝트이며 Ruyui Studios와 공식적으로 관련이 없습니다).

---

## 🤝 후원 및 기여 방법

ROEDEX는 오픈 소스이며, 여가 시간에 무료로 개발 및 유지 관리되고 있습니다. 이 트래커가 플레이에 도움이 되셨다면 리포지토리에 ⭐ 스타(Star)를 눌러 응원해 주세요!

서버 유지비, 자산 및 향후 신규 패치 개발을 위해 기부를 원하시는 경우, 아래 주소로 후원하실 수 있습니다:

<details>
<summary><b>🪙 EVM 및 Solana 후원 지갑 주소 열기</b></summary>

*   **Abstract Chain**: `0xeb6C0506F624239dAa704c375d0494B14ea81322`
*   **Global EVM Wallet**: `0x364aC821eEf0D90678F0B6df44b700d3Df14D89a`
*   **Solana**: `GzRU5v4Tyqx7iGrc7Saed943gMnbMuEDwrpC9vZWyreq`

</details>

*기부는 전적으로 자유로운 선택입니다. 따뜻한 성원에 감사드립니다!*

---
<div align="center">
  <p><i>Roots of Embervault 커뮤니티를 위해 ❤️으로 제작되었습니다.</i></p>
</div>
