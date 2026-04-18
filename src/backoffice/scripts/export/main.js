



function menu()
{
    const container = document.getElementById('sidebar-container');
    if (!container) return;
    container.classList.toggle('sidebar-container--visible');
    container.classList.toggle('sidebar-container--invisible');
}

function bindMenuControls()
{
    const menuButton = document.getElementById('menu-button');
    const mobileBlank = document.getElementById('sidebar-mobile-blank');

    if (menuButton)
        menuButton.addEventListener('click', menu);

    if (mobileBlank)
        mobileBlank.addEventListener('click', menu);
}

function initContentManager()
{
    const form = document.getElementById('content-form');
    if (!form) return;

    const feedback = document.getElementById('content-feedback');
    const list = document.getElementById('content-list');
    const resetButton = document.getElementById('reset-form');
    const editorTitle = document.getElementById('editor-title');
    const currentSlugInput = document.getElementById('currentSlug');

    function setFeedback(message, isError = false)
    {
        feedback.textContent = message;
        feedback.classList.toggle('content-feedback--error', isError);
    }

    function resetForm()
    {
        form.reset();
        currentSlugInput.value = '';
        editorTitle.textContent = 'Create content';
    }

    function fillForm(item)
    {
        currentSlugInput.value = item.slug;
        document.getElementById('title').value = item.title || '';
        document.getElementById('slug').value = item.slug || '';
        document.getElementById('excerpt').value = item.excerpt || '';
        document.getElementById('body').value = item.body || '';
        document.getElementById('status').value = item.status || 'draft';
        editorTitle.textContent = `Edit: ${ item.title }`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    async function loadContent()
    {
        const response = await fetch('/backoffice/content-api');
        const payload = await response.json();

        if (!response.ok || !payload.ok)
        {
            setFeedback(payload.error || 'Could not load content.', true);
            return;
        }

        const items = payload.data.content || [];

        if (items.length === 0)
        {
            list.innerHTML = '<p>No content has been created yet.</p>';
            return;
        }

        list.innerHTML = items.map((item) => `
          <article class="content-item">
            <div class="content-item__meta">
              <strong>${ escapeHtml(item.title) }</strong>
              <span>${ escapeHtml(item.status) }</span>
            </div>
            <p>${ escapeHtml(item.excerpt || (item.body || '').slice(0, 140)) }</p>
            <div class="content-item__footer">
              <code>${ escapeHtml(item.slug) }</code>
              <span>Updated ${ escapeHtml(item.updatedAt || item.createdAt || '') }</span>
            </div>
            <div class="content-item__actions">
              <button type="button" data-action="edit" data-slug="${ escapeHtml(item.slug) }">Edit</button>
              <button type="button" data-action="delete" data-slug="${ escapeHtml(item.slug) }">Delete</button>
            </div>
          </article>
        `).join('');

        list.querySelectorAll('[data-action="edit"]').forEach((button) =>
        {
            button.addEventListener('click', () =>
            {
                const item = items.find((entry) => entry.slug === button.dataset.slug);
                if (item) fillForm(item);
            });
        });

        list.querySelectorAll('[data-action="delete"]').forEach((button) =>
        {
            button.addEventListener('click', async () =>
            {
                const slug = button.dataset.slug;
                const confirmed = window.confirm(`Delete content "${ slug }"?`);
                if (!confirmed) return;

                const response = await fetch('/backoffice/content-api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug }),
                });
                const payload = await response.json();

                if (!response.ok || !payload.ok)
                {
                    setFeedback(payload.error || 'Could not delete content.', true);
                    return;
                }

                if (currentSlugInput.value === slug)
                    resetForm();

                setFeedback(`Deleted ${ slug }.`);
                await loadContent();
            });
        });
    }

    form.addEventListener('submit', async (event) =>
    {
        event.preventDefault();

        const formData = new FormData(form);
        const body = Object.fromEntries(formData.entries());

        const response = await fetch('/backoffice/content-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const payload = await response.json();

        if (!response.ok || !payload.ok)
        {
            setFeedback(payload.error || 'Could not save content.', true);
            return;
        }

        setFeedback(`Saved ${ payload.data.slug }.`);
        currentSlugInput.value = payload.data.slug;
        document.getElementById('slug').value = payload.data.slug;
        editorTitle.textContent = `Edit: ${ payload.data.content.title }`;
        await loadContent();
    });

    resetButton.addEventListener('click', () =>
    {
        resetForm();
        setFeedback('');
    });

    loadContent();
}

document.addEventListener('DOMContentLoaded', () =>
{
    bindMenuControls();
    initContentManager();
});

export { menu };
