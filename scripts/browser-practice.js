/* Paste into the TypeCat browser console after signing in. */
(() => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  const state = { version: 'timing-fix-3', running: false, stopped: false, completed: 0, receipts: [] }

  const panel = () => document.querySelector('aside[aria-label="Transaction activity"]')
  const button = label => [...document.querySelectorAll('button')].find(node => {
    const copy = node.cloneNode(true)
    copy.querySelectorAll('.material-symbols-outlined').forEach(icon => icon.remove())
    return copy.textContent.replace(/\s+/g, ' ').trim() === label && !node.disabled && node.getClientRects().length
  })

  async function waitFor(read, description, timeout = 150_000) {
    const end = Date.now() + timeout
    while (!state.stopped && Date.now() < end) {
      const error = panel()?.querySelector('[role="alert"]')
      if (error) {
        const message = error.querySelector('p')?.textContent.trim() || error.textContent.trim()
        error.querySelector('button:last-of-type')?.click()
        throw new Error(message)
      }
      const value = read()
      if (value) return value
      await sleep(350)
    }
    throw new Error(state.stopped ? 'Stopped by user' : `Timed out waiting for ${description}`)
  }

  const transaction = label => [...(panel()?.querySelectorAll('.border-l-2') || [])]
    .find(node => node.textContent.includes(label))
  const lastHash = label => transaction(label)?.querySelector('a[href*="/tx/"]')?.href
  const confirmed = (label, oldHash) => waitFor(() => {
    const row = transaction(label)
    const hash = row?.querySelector('a[href*="/tx/"]')?.href
    return row?.textContent.includes('Confirmed') && hash !== oldHash && hash
  }, `${label} confirmation`)

  async function nextPassage() {
    let clicked = false
    return waitFor(() => {
      const start = button('Start')
      const text = document.querySelector('.typing-font')?.textContent
      if (start && text?.length >= 25) return { start, text }
      const next = button('New Passage')
      if (!clicked && next) { next.click(); clicked = true }
    }, 'next passage')
  }

  async function runSession(number) {
    const { start, text } = await nextPassage()
    const oldStart = lastHash('Start typing session')
    const oldFinish = lastHash('Record verified result')
    start.click()
    await waitFor(() => document.querySelector('#current-char'), 'typing UI')
    await sleep(100)

    // Waiting for the start receipt before typing incorrectly adds chain latency
    // to browser duration, which is what caused the timing mismatch.
    const delay = Math.max(45, Math.ceil(6500 / text.length))
    for (const key of text) {
      if (state.stopped) throw new Error('Stopped by user')
      window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
      await sleep(delay)
    }

    const receipt = {
      start: await confirmed('Start typing session', oldStart),
      finish: await confirmed('Record verified result', oldFinish),
    }
    state.receipts.push(receipt)
    state.completed = number
    console.log(`${number} cycle(s) complete`, receipt)
  }

  window.typecatBatch = {
    status: () => ({ ...state, receipts: [...state.receipts] }),
    stop: () => { state.stopped = true },
    async start(confirmation, cycles = 200) {
      if (!Number.isInteger(cycles) || cycles < 1 || cycles > 200) throw new Error('Cycles must be 1 to 200')
      if (confirmation !== `MAINNET ${cycles} CYCLES`) throw new Error(`Use typecatBatch.start('MAINNET ${cycles} CYCLES', ${cycles})`)
      if (state.running) throw new Error('Batch already running')
      Object.assign(state, { running: true, stopped: false, completed: 0, receipts: [] })
      try {
        const health = await fetch('/api/health', { cache: 'no-store' }).then(response => response.json())
        if (health.network !== 'mainnet' || !health.configured) throw new Error('Backend is not configured for mainnet')
        button('Dismiss')?.click()
        const activity = await waitFor(panel, 'activity panel', 10_000)
        activity.querySelector('button[aria-expanded="false"]')?.click()
        if (!activity.textContent.includes('Avalanche') || activity.textContent.includes('Fuji')) throw new Error('Frontend is not on Avalanche mainnet')
        for (let number = 1; number <= cycles && !state.stopped; number++) await runSession(number)
        return state.receipts
      } finally {
        state.running = false
      }
    },
  }
  console.log("Ready (timing-fix-3): typecatBatch.start('MAINNET 200 CYCLES', 200)")
})()
