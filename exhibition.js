// 전시관 페이지 공통 스크립트
// - 소분류(강릉, 원주...)는 탭으로 고르고
// - 작품은 한 점씩 보여 주며 ‹ › 버튼 / 키보드 방향키 / 터치로 넘겨요.
(function () {
  document.documentElement.classList.add('js');

  const subs = Array.from(document.querySelectorAll('.sub'));
  const tabsBox = document.querySelector('.tabs');
  const pager = document.querySelector('.pager');
  if (!subs.length) return;

  const prevBtn = pager && pager.querySelector('.prev');
  const nextBtn = pager && pager.querySelector('.next');
  const counter = pager && pager.querySelector('.counter');

  let subIndex = 0;
  let frameIndex = 0;

  function frames() {
    return Array.from(subs[subIndex].querySelectorAll('.frame'));
  }

  function render() {
    subs.forEach((s, i) => s.classList.toggle('is-active', i === subIndex));
    const list = frames();
    frameIndex = Math.max(0, Math.min(frameIndex, list.length - 1));
    list.forEach((f, i) => f.classList.toggle('is-active', i === frameIndex));

    if (tabsBox) {
      tabsBox.querySelectorAll('button').forEach((b, i) => {
        b.classList.toggle('is-active', i === subIndex);
        b.setAttribute('aria-selected', i === subIndex ? 'true' : 'false');
      });
    }
    if (pager) {
      pager.hidden = list.length < 2;
      counter.textContent = (frameIndex + 1) + ' / ' + list.length;
      prevBtn.disabled = frameIndex === 0;
      nextBtn.disabled = frameIndex === list.length - 1;
    }
  }

  function go(step) {
    frameIndex += step;
    render();
  }

  function selectSub(i) {
    subIndex = i;
    frameIndex = 0;
    render();
  }

  // 탭 만들기 (소분류가 2개 이상일 때만 보여요)
  if (tabsBox) {
    subs.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.textContent = s.dataset.name;
      b.addEventListener('click', () => selectSub(i));
      tabsBox.appendChild(b);
    });
    tabsBox.hidden = subs.length < 2;
  }

  // 주소 뒤에 #gangneung 처럼 붙어 있으면 그 탭으로 바로 들어가요
  const hash = location.hash.replace('#', '');
  const found = subs.findIndex((s) => s.dataset.slug === hash);
  if (found >= 0) subIndex = found;

  // 같은 페이지 안에서 위쪽 메뉴의 소분류를 누르면 탭만 바꿔요
  window.addEventListener('hashchange', () => {
    const i = subs.findIndex((s) => s.dataset.slug === location.hash.replace('#', ''));
    if (i >= 0) selectSub(i);
  });

  if (pager) {
    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // 폰에서 좌우로 밀어서 넘기기
  let startX = null;
  const stage = document.querySelector('.stage');
  if (stage) {
    stage.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    });
  }

  // 마우스를 액자 위에 올리면 마우스 쪽으로 살짝 기울어져요 (입체 효과)
  document.querySelectorAll('.frame:not(.empty) .art').forEach((art) => {
    art.addEventListener('mousemove', (e) => {
      const r = art.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      art.style.setProperty('--ry', (x * 14) + 'deg');
      art.style.setProperty('--rx', (-y * 14) + 'deg');
    });
    art.addEventListener('mouseleave', () => {
      art.style.setProperty('--rx', '0deg');
      art.style.setProperty('--ry', '0deg');
    });
  });

  render();
})();
