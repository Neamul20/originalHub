// messaging.js – real-time polling message system

let activeProductId = null;
let activeOtherUserId = null;
let pollInterval = null;
let lastMessageId = 0;

// ── Load thread list ─────────────────────────────────────────────────────────
async function loadThreads() {
  const list = document.getElementById('thread-list');
  if (!list) return;
  try {
    const threads = await apiFetch('/messages/threads');
    if (!threads.length) {
      list.innerHTML = '<p style="padding:1rem;color:var(--text-muted);font-size:.9rem">No conversations yet.</p>';
      return;
    }
    list.innerHTML = threads.map(t => `
      <div class="thread-item ${t.product_id == activeProductId && t.other_user_id == activeOtherUserId ? 'active' : ''}"
           onclick="openThread(${t.product_id}, ${t.other_user_id})">
        <div class="thread-item-title">${escHtml(t.other_user_name || 'User')}</div>
        <div class="thread-item-preview">${escHtml(t.product_title || '')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.2rem">
          <span style="font-size:.75rem;color:var(--text-muted)">${timeAgo(t.last_message_at)}</span>
          ${parseInt(t.unread_count) > 0 ? `<span class="thread-unread">${t.unread_count} new</span>` : ''}
        </div>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = `<p class="error-msg" style="padding:1rem">${err.message}</p>`;
  }
}

// ── Open a specific thread ───────────────────────────────────────────────────
async function openThread(productId, otherUserId) {
  activeProductId   = productId;
  activeOtherUserId = otherUserId;
  lastMessageId     = 0;

  document.querySelectorAll('.thread-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.thread-item').forEach(el => {
    if (el.onclick?.toString().includes(`${productId}, ${otherUserId}`)) el.classList.add('active');
  });

  const main = document.getElementById('chat-main');
  if (main) {
    main.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
    main.style.display = 'flex';
  }

  if (pollInterval) clearInterval(pollInterval);
  await fetchMessages();
  pollInterval = setInterval(fetchMessages, (typeof ORIGINALHUB_CONFIG !== 'undefined' ? ORIGINALHUB_CONFIG.POLL_INTERVAL_MS : 3000));
}

// ── Fetch messages (polling) ──────────────────────────────────────────────────
async function fetchMessages() {
  if (!activeProductId || !activeOtherUserId) return;
  try {
    const data = await apiFetch(`/messages/${activeProductId}/${activeOtherUserId}`);
    renderChat(data);
    loadThreads(); // refresh unread counts
  } catch (err) {
    console.error('Poll error:', err.message);
  }
}

// ── Render chat area ──────────────────────────────────────────────────────────
function renderChat(data) {
  const main = document.getElementById('chat-main');
  if (!main) return;
  const me = Auth.getUser();
  const cfg = typeof ORIGINALHUB_CONFIG !== 'undefined' ? ORIGINALHUB_CONFIG : {};

  const product = data.product;
  const other   = data.other_user;

  main.innerHTML = `
    <div class="chat-header">
      Chat with ${escHtml(other?.full_name || 'Seller')}
      ${product ? ` about <em>${escHtml(product.title)}</em>` : ''}
      <button class="btn btn-outline btn-sm" style="float:right" onclick="reportConversation()">⚑ Report</button>
      <button class="btn btn-sm" style="float:right;margin-right:.5rem" onclick="blockUser(${activeOtherUserId})">🚫 Block</button>
    </div>

    ${product ? `
    <div class="chat-product-bar">
      ${product.thumbnail ? `<img src="${escHtml(product.thumbnail)}" alt="">` : ''}
      <div>
        <strong>${escHtml(product.title)}</strong><br>
        <span style="color:var(--primary)">${formatPrice(product.price)}</span>
      </div>
    </div>` : ''}

    <div class="alert alert-warning" style="margin:.5rem;border-radius:4px;font-size:.82rem">
      ${escHtml(cfg.PAYMENT_DISCLAIMER || '')}
    </div>

    <div class="chat-messages" id="messages-container">
      ${renderMessages(data.messages, me?.id)}
    </div>

    <div class="chat-input-area">
      <textarea id="msg-input" placeholder="Type a message…" maxlength="${cfg.MESSAGE_MAX_LENGTH || 2000}"
                onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage()}"
                rows="1"></textarea>
      <button class="btn btn-primary" onclick="sendMessage()">Send</button>
    </div>`;

  scrollToBottom();
}

function renderMessages(messages, myId) {
  if (!messages.length) return '<p style="text-align:center;color:var(--text-muted);padding:2rem">No messages yet. Say hi!</p>';
  return messages.map(m => {
    const isMine = m.from_user_id === myId;
    return `
      <div style="display:flex;flex-direction:column;align-items:${isMine ? 'flex-end' : 'flex-start'}">
        <div class="message-bubble ${isMine ? 'mine' : 'theirs'}">
          ${escHtml(m.message)}
          <div class="message-meta">${timeAgo(m.created_at)}</div>
        </div>
      </div>`;
  }).join('');
}

function scrollToBottom() {
  const c = document.getElementById('messages-container');
  if (c) c.scrollTop = c.scrollHeight;
}

// ── Send message ──────────────────────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('msg-input');
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  input.disabled = true;

  try {
    await apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ product_id: activeProductId, to_user_id: activeOtherUserId, message }),
    });
    await fetchMessages();
  } catch (err) {
    toast(err.message, 'danger');
    input.value = message;
  } finally {
    input.disabled = false;
    input.focus();
  }
}

// ── Start a new chat from product page ───────────────────────────────────────
async function initFromUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const productId  = params.get('product');
  const otherUserId = params.get('user');
  if (productId && otherUserId) {
    await loadThreads();
    await openThread(productId, otherUserId);
  } else {
    await loadThreads();
  }
}

async function blockUser(userId) {
  if (!confirm('Block this user? You will no longer receive messages from them.')) return;
  try {
    await apiFetch('/messages/block', { method: 'POST', body: JSON.stringify({ user_id: userId }) });
    toast('User blocked');
    window.location.reload();
  } catch (err) { toast(err.message, 'danger'); }
}

async function reportConversation() {
  const reason = prompt('Reason for report:\n1. Harassment\n2. Scam attempt\n3. Spam\n4. Other\n\nType the reason:');
  if (!reason) return;
  try {
    await apiFetch('/reports', {
      method: 'POST',
      body: JSON.stringify({ conversation_product_id: activeProductId, reason }),
    });
    toast('Report submitted');
  } catch (err) { toast(err.message, 'danger'); }
}
