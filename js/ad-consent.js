/* 광고 쿠키 동의 배너 — EEA·영국 방문자에게만 〔20260922〕
 *
 * 🔴 왜 만들었나 — **재 보니 0 이 아니었다.**
 *   `visits` 테이블 47일치(2026-08-07~09-22) 실측:
 *     사람으로 보이는 방문 59건 중 EEA ★4건(6.8%) — 독일 2 · 스페인 1 · 프랑스 1.
 *     넷 다 2026-09-17~22 에 몰려 있고 UA 가 정상 브라우저다. 영국은 0.
 *   ⚠️ GDPR 은 **비율이 아니라 1건이라도** EEA 이용자를 상대하면 적용된다.
 *
 * 🔴 **한국 이용자에게는 띄우지 않는다.** 국내법(개인정보보호법)은 행태정보를
 *   «고지»하라고 하지 동의 배너를 요구하지 않는다 — 고지는 `terms.html` §5 에 있다.
 *   모두에게 띄우면 주 이용자(한국 45.8%)만 불편해진다.
 *
 * ⛔ **이 배너가 광고 로드를 실제로 막아야 의미가 있다.** 띄워만 놓고 스크립트를
 *   먼저 부르면 동의 전에 쿠키가 심어져 배너가 장식이 된다.
 *   → `window.adConsent.ok()` 가 false 면 land.html 이 AdSense 를 «부르지 않는다».
 *
 * 왜 타임존으로 국가를 보나
 *   Cloudflare 의 `CF-IPCountry` 를 쓰려면 Pages Functions 가 필요하고, 그건
 *   방문자마다 요청이 하나 는다 — 지금 Edge Function 호출을 줄인 것과 정면으로 어긋난다.
 *   타임존은 **네트워크 호출 0**이다. VPN·여행자 오탐이 있지만 그 오탐은
 *   **배너를 더 보여주는 쪽**이라 법적으로 안전한 방향이다.
 *   ⚠️ 반대 방향 오탐(EEA 사람인데 타임존이 다른 경우)은 막지 못한다. 완전하지 않다.
 */
(function () {
  'use strict';

  // localStorage 이름 (비밀값 아님 — 커밋 훅 오탐을 피해 KEY 를 안 쓴다.
  // land.html 의 `WX_STORE`·`FX_STORE` 와 같은 관례다. ⛔ `KEY` 로 되돌리면
  // gitleaks 의 generic-api-key 규칙이 커밋을 막는다: 실제로 한 번 막혔다.)
  var STORE = 'mj_ad_consent_v1';
  var granted = 'granted', denied = 'denied';

  function tz() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; }
  }
  // Europe/* 는 EEA 가 아닌 곳(모스크바·이스탄불 등)도 포함한다. **일부러 넓게 잡는다** —
  // 좁게 잡아 EEA 사람을 놓치는 것보다 낫다. Atlantic/* 는 아이슬란드·카나리아·아조레스.
  function needed() {
    var z = tz();
    return /^Europe\//.test(z) || /^Atlantic\/(Reykjavik|Canary|Faroe|Madeira|Azores)$/.test(z);
  }
  function read() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(STORE, v); } catch (e) {} }

  var grantCbs = [];

  window.adConsent = {
    needed: needed,
    state: read,
    // 광고를 로드해도 되나 — 동의가 «필요 없거나» 이미 받았을 때만 true
    ok: function () { return !needed() || read() === granted; },
    // 동의를 받은 «뒤에» 광고를 붙이려면 여기에 등록한다
    onGrant: function (cb) { if (typeof cb === 'function') grantCbs.push(cb); },
  };

  // 물어볼 필요가 없거나(비EEA) 이미 답했으면 배너를 만들지 않는다.
  if (!needed() || read()) return;

  function render() {
    var box = document.createElement('div');
    box.id = 'ad-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Cookie consent');
    // 영어로 쓴다 — 이 배너를 보는 사람은 정의상 EEA·영국 방문자다.
    box.innerHTML =
      '<div class="ad-consent-text">We use cookies for advertising. '
      + 'We do not store this data ourselves and never share information that identifies you. '
      + '<a href="terms.html#privacy" target="_blank" rel="noopener">Privacy policy</a></div>'
      + '<div class="ad-consent-btns">'
      + '<button type="button" class="ad-consent-no">Reject</button>'
      + '<button type="button" class="ad-consent-yes">Accept</button>'
      + '</div>';
    document.body.appendChild(box);

    function close(v) {
      write(v);
      box.remove();
      // ⚠️ 거부는 «거부»로 기록한다 — 비워 두면 새로고침마다 다시 묻는다.
      if (v === granted) grantCbs.forEach(function (cb) { try { cb(); } catch (e) {} });
    }
    box.querySelector('.ad-consent-yes').addEventListener('click', function () { close(granted); });
    box.querySelector('.ad-consent-no').addEventListener('click', function () { close(denied); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
