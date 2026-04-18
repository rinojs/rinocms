function hello()
{
    alert("Hello, World!");
}

function escapeHtml(value)
{
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatParagraphs(value)
{
    return escapeHtml(value)
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${ paragraph.replaceAll('\n', '<br />') }</p>`)
        .join('');
}

async function initPublicContentList()
{
    const container = document.getElementById('public-content-list');
    if (!container) return;

    const response = await fetch('/content-api');
    const payload = await response.json();

    if (!response.ok || !payload.ok)
    {
        container.innerHTML = '<p>Could not load published content.</p>';
        return;
    }

    const items = payload.data.content || [];

    if (items.length === 0)
    {
        container.innerHTML = '<p>No published content yet.</p>';
        return;
    }

    container.innerHTML = items.map((item) => `
      <article class="public-content-card">
        <p class="published-time">${ escapeHtml(item.publishedAt || item.updatedAt || item.createdAt || '') }</p>
        <h3>${ escapeHtml(item.title) }</h3>
        <p>${ escapeHtml(item.excerpt || (item.body || '').slice(0, 180)) }</p>
        <a href="/content?slug=${ encodeURIComponent(item.slug) }">Read article</a>
      </article>
    `).join('');
}

async function initPublicContentDetail()
{
    const container = document.getElementById('public-content-detail');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug)
    {
        container.innerHTML = '<p>Content slug is missing.</p>';
        return;
    }

    const response = await fetch(`/content-api/${ encodeURIComponent(slug) }`);
    const payload = await response.json();

    if (!response.ok || !payload.ok)
    {
        container.innerHTML = '<p>Published content was not found.</p>';
        return;
    }

    const item = payload.data.content;

    document.title = `${ item.title } | Rino CMS`;
    container.innerHTML = `
      <p class="eyebrow">Published article</p>
      <h1>${ escapeHtml(item.title) }</h1>
      <p class="published-time">Published ${ escapeHtml(item.publishedAt || item.updatedAt || item.createdAt || '') }</p>
      <p class="public-content-excerpt">${ escapeHtml(item.excerpt || '') }</p>
      <div class="public-content-body">
        ${ formatParagraphs(item.body || '') }
      </div>
      <p><a href="/content-list">Back to all content</a></p>
    `;
}

document.addEventListener('DOMContentLoaded', () =>
{
    initPublicContentList();
    initPublicContentDetail();
});

export { hello };
