<div align="center">
  <img src="public/logo.png" alt="ROEDEX 로고" width="128" />
  
  # ROEDEX 컴패니언 툴
  
  ### *Roots of Embervault를 위한 궁극의 실시간 트래커 및 대화형 오버레이 수트*

  <p align="center">
    <a href="README.md">🇺🇸 English</a> • 
    <a href="README.es.md">🇪🇸 Español</a> • 
    <a href="README.ru.md">🇷🇺 Русский</a> • 
    <a href="README.ko.md">🇰🇷 한국어</a>
  </p>

  ---

  <p align="center">
    <a href="https://chromewebstore.google.com/detail/roedex/fgdehjebfkbdefdnenpgjejjnhlkchjh" target="_blank">
      <img src="https://img.shields.io/chrome-web-store/v/fgdehjebfkbdefdnenpgjejjnhlkchjh?label=Chrome%20%EC%9B%B9%20%EC%8A%A4%ED%86%A0%EC%96%B4%EC%97%90%EC%84%9C%20%EC%84%A4%EC%B9%98&style=for-the-badge&color=22d3ee&logo=googlechrome&logoColor=white" alt="Chrome 웹 스토어" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/%EB%B2%84%EC%A0%84-v0.0.4-blue.svg?style=flat-square&color=3b82f6" alt="버전" />
    <img src="https://img.shields.io/badge/React-19.0.0-blue.svg?style=flat-square&color=61dafb&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square&color=3178c6&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4-MIT-green.svg?style=flat-square&color=10b981" alt="라이선스" />
  </p>
</div>

> [!IMPORTANT]
> **공식 협력 및 지원:**  
> ROEDEX는 **Voxel Queen**(*Roots of Embervault* 공동 설립자)과의 긴밀한 파트너십을 통해 개발되었으며, **Ruyui Studios**로부터 공식적으로 제공받은 게임 맵 데이터를 지원받아 작동합니다. 이 협력 덕분에 높은 정확도를 자랑하는 정적 리스폰 맵핑 및 고성능 내비게이션 기능을 제공할 수 있게 되었습니다!  
> *참고: ROEDEX는 Ruyui Studios에 의해 검증(감사)되거나 공식적으로 보증되지 않았습니다.*

---

## 📖 목차
1. [🌟 개요](#-개요)
2. [✨ 핵심 기능](#-핵심-기능)
3. [📢 v0.0.4 신규 업데이트 내용](#-v004-신규-업데이트-내용)
4. [🎮 단축키 안내](#-단축키-안내)
5. [🔒 보안 및 개인정보 보호](#-보안-및-개인정보-보호)
6. [🛠️ 설치 가이드](#️-설치-가이드)
7. [🏆 크레딧 및 감사 인사](#-크레딧-및-감사-인사)
8. [🤝 후원 및 기여 방법](#-후원-및-기여-방법)

---

## 🌟 개요

**ROEDEX**는 *Roots of Embervault* 플레이어를 위한 프리미엄 비침습적 클라이언트 사이드 오버레이 확장 프로그램입니다. 백그라운드에서 실시간 WebSocket 패킷을 안전하게 분석하여 게임 내 실시간 통계, 리스폰 타이머, 전리품 기록, AI 컴패니언 등 유용한 정보들을 제공합니다.

**Manifest V3**, **React**, **Tailwind CSS**로 구축되었으며, AAA 게임 대시보드와 같은 프리미엄 디자인의 **글래스모피즘(Glassmorphism) UI**를 선사합니다.

---

## ✨ 핵심 기능

| 기능 | 상세 설명 |
| :--- | :--- |
| **📈 실시간 세션 추적** | 시간당 획득 XP, 룬스톤 수, 전리품 및 골드 가치 자동 계산. |
| **🤖 대화형 AI 컴패니언** | 게임 내 상황에 유기적으로 반응하는 4명의 고유 캐릭터 (**밥**, **카야**, **리아**, **크래쉬**). |
| **🗺️ 정밀 맵 데이터 리스폰** | 공식 지도 데이터를 사용하여 자원, NPC, 보스의 현재 위치 및 정확한 리스폰 대기 시간을 추적. |
| **⚔️ 장비 내구도 경고** | 무기 및 방어구 내구도를 실시간 모니터링하여 장비 파손 전 경고 알림 전송. |
| **🌐 다국어 지원** | **한국어, 영어, 스페인어, 러시아어** 지원 및 전용 로컬라이제이션 가이드 제공. |
| **🎨 글래스모피즘 테마** | 옵시디언 골드, 홀로그램, 루비 글래스 테마 지원 및 분리형 팝업 창 제공. |
| **📐 직관적인 레이아웃 설정** | 8방향 크기 조절, 레이아웃 전환(가로/세로) 및 창 위치 자동 기억. |
| **⚡ 고성능 최적화** | 12시간 이상의 세션 테스트를 거친 메모리 누수 방지 설계, 에셋 압축 및 경량 Vite 빌드 완료. |

---

## 📢 v0.0.4 신규 업데이트 내용

*   🌍 **전체 번역 완료:** 퀘스트 보드, 대장간, 주변 플레이어 목록 등 UI의 남은 모든 영문 텍스트를 다국어 번역 엔진에 완벽히 통합했습니다.
*   🐛 **상자 HUD 버그 수정:** 아이템 이동 중 상자를 닫았을 때 최소 상자 HUD가 화면에서 사라지지 않던 문제를 해결했습니다.
*   ⌨️ **단축키 설정 저장:** 단축키 설정(UI 잠금, 레이아웃 전환, 크기 초기화)이 확장 프로그램을 다시 로드한 후에도 안전하게 유지됩니다.
*   ⏱️ **초기 부팅 지연 시간 최적화:** 로딩 후 첫 활성 게임 패킷을 감지할 때까지 대기(5초간 페이드인 효과 포함)하도록 하여 깔끔하게 진입합니다.

---

## 🎮 단축키 안내

아래 단축키는 **설정 탭**에서 원하시는 대로 변경하실 수 있습니다:

| 액션 | 기본 단축키 | 상세 설명 |
| :--- | :--- | :--- |
| **HUD 최소화 / 최대화** | `Ctrl + Shift + M` | ROEDEX UI 전체를 작은 플로팅 오브로 최소화하거나 다시 복구합니다. |
| **레이아웃 모드 전환** | `Shift + H` | 세로 열 보기 모드와 가로 행 보기 모드를 즉시 전환합니다. |
| **오버레이 크기 초기화** | `Shift + R` | 모든 오버레이 창 크기를 최적화된 기본 규격으로 재설정합니다. |
| **UI 잠금 / 잠금 해제** | `Shift + U` | 창 위치를 고정하고 클릭 스루(통과) 모드를 활성화하여 쾌적한 조작을 돕습니다. |

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
*   🎮 **Ruyui Studios** – *Roots of Embervault* 개발 스튜디오 — 커뮤니티 제작 도구 및 동반 성장을 지지해 주셔서 대단히 감사합니다.

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
