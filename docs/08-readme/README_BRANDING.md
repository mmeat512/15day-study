# StockStudy 브랜딩 가이드

## 로고 및 파비콘

### 색상 팔레트

프로젝트는 Fintech 교육 앱에 최적화된 색상을 사용합니다:

#### 주 색상 (Primary)
- **트러스트 블루**: `#048CFC` - 신뢰성과 안정성을 나타냄
- **딥 블루**: `#0066FF` - 전문성과 금융을 상징
- **다크 블루**: `#0052CC` - 강조 요소

#### 강조 색상 (Accent)
- **성장 그린**: `#10B981` - 성장, 진행, 긍정적 결과
- **다크 그린**: `#059669` - 보조 강조

#### 배경 및 보조 색상
- **라이트 블루**: `#E6F2FF` - 부드러운 배경
- **라이트 민트**: `#E6FAF5` - 신선한 느낌

#### 다양성 색상 (커뮤니티)
- **틸**: `#14B8A6` - 사용자 1
- **오렌지**: `#F59E0B` - 사용자 2
- **블루**: `#0066FF` - 사용자 3

### 디자인 원칙

1. **신뢰성**: 파란색 계열로 금융 서비스의 신뢰성 표현
2. **성장**: 녹색으로 학습 진행과 성장 시각화
3. **접근성**: 높은 대비와 명확한 시각적 계층 구조
4. **현대성**: 깔끔한 그라데이션과 미니멀한 디자인

## 파일 구조

```
public/
├── logo.svg              # 메인 로고 (200x200)
├── icon.svg              # 파비콘 (48x48, SVG)
├── opengraph-image.svg   # Open Graph 이미지 (1200x630)
└── manifest.json         # PWA 매니페스트

src/app/
├── icon.svg              # Next.js 자동 파비콘
├── layout.tsx            # 메타데이터 설정
├── robots.ts             # robots.txt 설정
└── sitemap.ts            # 사이트맵 생성
```

## 메타데이터

프로젝트는 다음의 SEO 최적화를 포함합니다:

- ✅ 완전한 Open Graph 메타태그
- ✅ Twitter Card 지원
- ✅ Progressive Web App (PWA) 매니페스트
- ✅ 검색 엔진 최적화 robots.txt
- ✅ 동적 사이트맵 생성
- ✅ 모바일 최적화 viewport 설정

## 사용 가이드

### 로고 사용

메인 로고는 `/public/logo.svg`에 위치하며, 다음과 같이 사용합니다:

```tsx
import Image from "next/image";

<Image src="/logo.svg" alt="StockStudy" width={200} height={200} />
```

### 파비콘

Next.js 16은 자동으로 `/src/app/icon.svg`를 파비콘으로 사용합니다.
추가 설정은 필요하지 않습니다.

### 테마 컬러

앱의 테마 컬러는 `#048CFC`로 설정되어 있으며, 브라우저 UI와 PWA 설치 시 사용됩니다.

## 저작권 및 라이선스

이 브랜딩 에셋은 StockStudy 프로젝트를 위해 제작되었습니다.
모든 디자인 요소는 저작권 걱정 없이 사용 가능한 오픈소스 방식으로 제작되었습니다.

### 참고 자료

- [Fintech 앱 색상 심리학](https://windmill.digital/psychology-of-color-in-financial-app-design/)
- [2025 Fintech UX 트렌드](https://adamfard.com/blog/fintech-ux-trends)
- [Favicon 베스트 프랙티스](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)
- [Favicon 크기 및 형식 가이드](https://favicon.im/blog/complete-favicon-size-format-guide-2025)

## 추가 개선 사항

PNG 파비콘이 필요한 경우:

1. [RealFaviconGenerator](https://realfavicongenerator.net/)에서 SVG 업로드
2. 생성된 파일들을 `/public`에 저장
3. `layout.tsx`의 icons 설정 업데이트

```tsx
icons: {
  icon: [
    { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    { url: "/icon.svg", type: "image/svg+xml" },
  ],
  apple: [
    { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  ],
},
```
