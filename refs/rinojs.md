## About Rino.js
### When modifying a Rino.js client:
- Do not break directory structure.
- Do not introduce circular components.
- Do not modify generated `/scripts` or `/styles` output files directly.
- Use rino-config.js for configuration changes.
- Use i18n JSON files for translation changes.
- Only use documented Rino syntax.

### Important Notes for AI
- Rino is structure-driven.
- Pages mirror filesystem.
- Components are HTML-based.
- Scripts and styles are build pipelines.
- i18n is compiler-integrated.

### Overview
Rino.js is a static site generator (SSG) built around project directory structure. The file and folder structure directly determines the website structure.

#### Rino supports:
- HTML-based page templating
- Component composition
- Markdown loading
- CSS bundling
- JS bundling
- i18n localization system

### Root Directory Structure
```
pages/
components/
public/
scripts/
  export/
styles/
  export/
i18n/
rino-config.js
```
### Directory Responsibilities
#### /pages
1. Purpose: Base HTML pages.
2. Behavior:
 - Rino builds output pages based on this structure.
 - Folder and file structure is preserved in output.
 - Supports <component> and <lang> syntax.
3. Rule: Do not generate dynamic routing here. Structure defines URL.

#### /components
Reusable HTML components. Supports nested components.

1. Usage:
```
<component rino-path="/header" />
<component rino-path="/ko/footer" />
```

2. Attributes:
- rino-path (required)
- rino-tag (optional)

3. Example:
```
<component rino-path="/button" rino-tag="button" onclick="myFunction()" />
```

Important: Avoid circular component imports.

#### /public
- Static assets directory.
- Images
- External CSS
- External JS
- Fonts
- Any raw static files

#### /scripts
1. JavaScript/TypeScript build system.
- Uses ES Modules (import/export)
- Can use npm packages
- Files inside `/scripts/export/` are built and output to `/scripts/`

2. Example usage:

```
<script src="/scripts/example.js"></script>
```

3. Naming rule:
If file is `hello.js` Then accessed globally as `hello.FunctionName()`

4. Supports:
- TypeScript
- Browser-standard module development

#### /styles
1. CSS build system.
- Files in `/styles/export/` are bundled
- Output to `/styles/`

2. Import local CSS using:
```
@import "../header.css";
@import "../footer.css";
```

3. Usage:
```
<link rel="stylesheet" href="/styles/example.css" />
```

#### rino-config.js
1. Main configuration file.
2. Controls:
- Distribution directory
- Dev server port
- Site URL (sitemap)
- i18n configuration
- Locale selection

3. Example i18n config:
```
i18n: {
  defaultLocale: "en",
  locales: ["en", "ko"]
}
```
Only listed locales are built.

#### Inline Markdown
<script rino-type="md">
# Title
Markdown inside HTML
</script>

#### Internationalization (i18n)
1. Directory:
```
i18n/
  en/
    index.json
  ko/
    index.json
```

2. Usage in HTML:
```
<h1><lang>header.title</lang></h1>
```

3. Features:
- Nested object support
- Array indexing: items[0].label
- Missing key fallback
- Default locale fallback
- Locale-specific build under `/dist/<locale>/`