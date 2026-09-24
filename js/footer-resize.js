// 푸터·헤더·통계 띠 세로 크기 조절 — 손잡이를 드래그. 크기는 localStorage에 저장.
// 드래그 로직은 js/ui-resize.js 의 공용 makeResizable() 을 쓴다 (리사이즈 버그 수정 지점 통일).
(function () {
  // 저장된 높이를 되살리고(범위 안일 때만) 드래그가 끝나면 저장한다. 세 띠가 같은 부품이다.
  // wide() 가 거짓이면(모바일) 되살리지 않는다. 저장소가 막혀 있으면 되살리기만 건너뛴다.
  function setupResize(el, handle, key, opts) {
    if (!el || !handle) return;
    var wide = opts.wide || function () { return true; };
    var saved = NaN;
    try { saved = parseInt(localStorage.getItem(key), 10); } catch (e) {}
    var maxNow = typeof opts.maxH === 'function' ? opts.maxH() : opts.maxH;
    if (wide() && saved >= opts.minH && saved <= maxNow) el.style.height = saved + 'px';
    makeResizable(handle, el, {
      axis: 'h',
      reverseH: opts.reverseH,
      minH: opts.minH,
      maxH: opts.maxH,
      onEnd: function () {
        try { localStorage.setItem(key, String(el.offsetHeight)); } catch (e) {}
      }
    });
  }
  var wideOnly = function () { return window.matchMedia('(min-width:641px)').matches; };

  // 푸터 — 핸들이 위쪽에 있으므로 위로 끌면 커진다(reverseH).
  setupResize(document.getElementById('site-footer'), document.getElementById('footer-resize'), 'mj-footer-height',
    { reverseH: true, minH: 24, maxH: function () { return window.innerHeight * 0.6; } });

  // 헤더 — 푸터와 같은 부품을 위아래만 뒤집은 것(2026-09-16 사용자 지시).
  // 손잡이가 **아래쪽**에 있으므로 reverseH 를 쓰지 않는다 — 아래로 끌면 커진다.
  // ⛔ 모바일(≤640px)에서는 건드리지 않는다 — 거기선 header 가 height:auto 로 두 줄이 되고,
  //    인라인 height 를 박으면 내용이 잘린다. 손잡이도 CSS 에서 숨겨 둔다.
  // minH 44 = 34px 아이콘 버튼 + 상하 여백이 들어가는 최소값.
  setupResize(document.querySelector('header'), document.getElementById('header-resize'), 'mj-header-height',
    { minH: 44, maxH: 160, wide: wideOnly });

  // 통계 띠 — 지도와의 경계선. 헤더와 같은 부품·같은 방향이다(손잡이가 띠 **아래**).
  // minH 18 = 12.5px 글자가 잘리지 않는 최소값.
  setupResize(document.getElementById('stat-bar'), document.getElementById('stat-resize'), 'mj-statbar-height',
    { minH: 18, maxH: 60, wide: wideOnly });
})();
