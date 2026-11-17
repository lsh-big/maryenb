# 얼굴 비교 슬라이더 및 생성 이미지

`src/components/skin-comparison.js`의 네이티브 range 입력으로 두 패널을 겹쳐 보여줍니다. 터치·마우스·키보드를 지원하고 전체 보기와 초기 위치 복원 버튼을 제공합니다. 이미지는 `public/images/demo/skin-appearance-illustration.png`에 저장했습니다.

최신 버전은 내장 `image_gen` 도구로 제작한 20대 성인 동양인 여성의 가상 일러스트 6종입니다. 실존 고객이나 임상시험 결과를 나타내지 않습니다. 제품별 효능을 임의로 만들어 보이지 않도록 `src/data/skin-examples.js`가 제품별로 서로 다른 이미지를 연결합니다. VNC15는 칙칙한 톤, ANC5는 볼 붉은기, ANC10은 붉은기·피부결, RNT는 잔결, TNA5는 잡티·불균일한 톤, NTZ20은 유분광·모공을 표현합니다. 함량별 효과 우열은 표현하지 않습니다. 이미지 안쪽과 본문에 실제 사용 전후가 아니라는 문구를 항상 표시합니다. 실제 자료를 대체하는 비포/애프터 증거로 사용하지 않습니다.

## 최신 파일과 프롬프트

최신 자산은 `public/images/demo/skin-{vnc15,anc5,anc10,rnt,tna5,ntz20}-v2.png`에 각각 저장했습니다. 6개 최종 프롬프트 전문은 `skin-image-prompts-v2.json`에 기록했습니다.

## 이전 버전 생성 프롬프트 (미사용 자산 기록)

Use case: scientific-educational. Asset type: ONE wide diptych raster image for an explicitly labeled fictional skin-appearance comparison slider on a skincare demo website; this is NOT clinical evidence, NOT a treatment result, and NOT a testimonial. Create two equally sized SQUARE portrait panels directly adjacent, total canvas aspect ratio exactly 2:1. Each panel repeats the IDENTICAL fictional adult East Asian woman aged around 35, front-facing close-up head portrait, neutral relaxed expression, hair tied back, cream backdrop, no makeup, matching camera, lighting, facial landmarks and head size EXACTLY pixel-aligned relative to each square panel. Soft editorial digital illustration with visible painterly shading, clearly an illustration rather than a real patient photograph, refined realistic facial proportions. Show whole forehead and chin within each square, face centered. Left square: subtle natural uneven complexion, slight cheek redness, visible skin texture and small freckles, mild fine lines. Right square: same identity and expression with a somewhat more visually even skin rendering, retain realistic pores, same skin tone and pigmentation family, no whitening, no perfect poreless skin, no dramatic age change. The differences are purely illustrative alternatives of skin appearance, with no implied product mechanism. No border or gap between panels, no vertical line, no text, no labels, no typography, no watermark, no products, no logos. Keep nose, eyes, mouth, hair, neck, clothing, backdrop, illumination and pose invariant across both panels. A slider will reveal each panel at the same coordinates so geometric registration is critical. Warm ivory and muted rose art direction.
