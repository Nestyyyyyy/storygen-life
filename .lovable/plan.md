## 1. Onboarding page layout (`src/routes/index.tsx`)

- Wrap the pre-game screen in a `min-h-dvh` flex container that vertically centers sidebar + form on desktop; `p-8` (32px) desktop, `p-4` (16px) mobile, `max-w-6xl` centered.
- Form becomes `grid grid-cols-2 gap-5` (20px) on `md+`, single column below 768px. "Nihai hedef" spans both columns. Labels, inputs, and button rows aligned on a shared baseline via consistent wrapper markup.
- All controls min height 44px (`min-h-11`), full width on mobile.
- Verify at 320px and 200% zoom with Playwright screenshots.

## 2. Typography & contrast (`src/styles.css`)

- `.field` font-size to 0.875rem (14px) min; body base 14px+; labels 12px min (remove `text-[11px]` usages in this flow).
- Raise `--muted-foreground` lightness (~oklch 0.78) for 4.5:1 on the card background; raise `--border`/`--input` alpha so control edges hit 3:1.
- Add a global 2px visible focus ring utility (`outline: 2px solid var(--ring); outline-offset: 2px`) applied to inputs, buttons, and radios via `:focus-visible`.

## 3. Labeled actions (`src/components/CharacterField.tsx`)

- Replace icon-only sparkle/speech-bubble buttons with labeled buttons: "AI ile öner" (Sparkles + text) and "İpucu ver" (MessageSquarePlus + text), each with `aria-label` and `aria-expanded` where relevant.
- Add explicit states: loading (spinner + "Öneriliyor…", `aria-busy`), success (brief check + `role="status"` live region announcing the suggestion), error (inline destructive text + icon, `role="alert"`).
- Buttons wrap below the input on mobile, full width, 44px tall.

## 4. Cinsiyet radio group

- Convert to a semantic `<fieldset>` + `<legend>` with real `<input type="radio">` inputs (visually styled labels), keyboard arrow navigation for free.
- Selected state: filled high-contrast background + `Check`/radio-dot indicator, not teal-only. Options wrap cleanly, each ≥44px.

## 5. Metrics card

- Title the stats block "Başlangıç değerleri" with a one-line explanation ("Her değer 0–100 arası; seçimlerin bunları değiştirir.").
- Each StatBar keeps icon + text label + numeric value, so state never depends on color alone; add `role="img"`-style `aria-label` per bar (e.g. "Mutluluk 60 / 100").

## 6. Story bugs (`src/lib/life.functions.ts` + `src/routes/index.tsx`)

**Continuity (dog "Şila" → "Tarçın")**: history currently sends only `{event title, choice}`, so named details in narratives are lost and the model re-invents them.
- Send a richer history entry: title + a trimmed narrative/outcome snippet along with the choice.
- Maintain a running `facts` list (persistent names: people, pets, places) that the model returns as a `facts` array each turn; accumulate client-side and pass back every turn with the rule "bu isimleri asla değiştirme, yeni isim uydurmadan önce listeyi kontrol et".

**Same opening every run**: the opening prompt is fully deterministic aside from model sampling.
- Add a server-side random seed per run: pick a random life-domain (aşk, aile, komşuluk, sağlık, evcil hayvan, tesadüf, kayıp, para…), a random time-of-day/mekân cue, and a random tonal register, and inject them into the opening user message; also pass a random nonce and keep temperature high.
- Explicitly forbid repeating the seeded domain in the next 2 turns.

## 7. Badge

- Turn off the fixed "Edit with Lovable" production badge via publish settings (requires a Pro plan; if the plan doesn't allow it, I'll report back rather than hacking it in CSS).

## Preserved

Dark palette, teal primary CTA, panel/glow style, gradient hero — only contrast and hierarchy change.
