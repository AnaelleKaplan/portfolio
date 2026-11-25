# Anaelle's Portfolio — V20 · Pages CMS edition

This is the V19 website design with a **content-editable layer** added. It works as a normal static site on **GitHub Pages**; no build process, package manager, or server is required for the published site.

## Replace your currently published V19 website

1. In GitHub, open the repository that currently hosts your portfolio. Optionally, save a backup with **Code → Download ZIP** before making changes. Your commit history also lets you restore previous versions.
2. Unzip `anaelle_portfolio_v20_pages_cms.zip` on your computer.
3. Choose **Add file → Upload files** in the repository. Drag **everything inside** the extracted folder into the upload area, preserving all folders. Do not upload the ZIP itself, and do not create a parent `anaelle_portfolio_v20` directory in the repository.
4. Verify that `index.html`, `.pages.yml`, `home-content.js`, `project-content.js`, the `content/` folder, the `projects/` folder, `assets/`, and `videos/` are at the root level in GitHub.
5. Commit the updates directly to the `main` branch, or merge the changes into `main` if GitHub offers a pull request.
6. Your existing GitHub Pages URL and configuration (main branch, root folder) remain unchanged. Refresh the public website after the deployment.

## Connect the visual editor

1. Open **https://app.pagescms.org/**.
2. Sign in with the same GitHub account.
3. If prompted, **install/authorize the Pages CMS GitHub App**. Choose **Only select repositories** and grant it access to your portfolio repository (rather than every repository).
4. Open your portfolio repository in Pages CMS and choose the `main` branch.
5. The editor should show two entries:
   - **About, contact and galleries** → `content/site.json`
   - **Projects — journal and pages** → `content/projects.json`
6. Open **About, contact and galleries** first. Replace the temporary `your-email@example.com` with your address and save.
7. Open **Projects**. Edit any entry's title, short journal description, page descriptions, gallery images, video, and optional external link. Save. The homepage journal and the project's separate page both read this single project file; no duplicate edits are needed.

Pages CMS edits files in your repository. The changes are committed to GitHub, and GitHub Pages republishes them. No separate CMS database is used for your portfolio content.

## What you can edit without touching HTML

- **About:** name, introduction, portrait, specialties, software/tools.
- **Journal:** project order, names, categories, previews, thumbnails.
- **Project pages:** subtitle, longer descriptions, images, video or YouTube/Vimeo embed, external link (itch.io, YouTube, interactive film, etc.).
- **Photo opening:** replace/reorder up to 12 photographs while retaining the existing collage design.
- **Stills and Worlds:** replace, remove, reorder, or add gallery images.
- **Contact:** final headline, explanatory text, contact email.

**Important:** the editor changes the content, *not* the website design, animation, or layout. Use the HTML/CSS/JS files when you want to change those elements.

## How project links work

- The six original projects preserve their individual URLs, e.g. `projects/trust-the-plan.html`.
- Newly added projects automatically use `projects/project.html?slug=my-new-project` (which is a distinct, shareable URL showing that project's content).
- Keep project IDs/`slug` values stable once published. Titles can change freely.
- The **Back to the journal** link takes the visitor to the relevant project entry and centers it in view.

## Photos and videos

- Upload images via the editor's image fields or the Photos and artwork media library; files go into `assets/` in the GitHub repository.
- Upload short MP4/WebM videos using the video field; files go into `videos/`.
- To use an existing YouTube or Vimeo video, paste its URL into **YouTube or Vimeo URL instead of uploaded video**. This takes priority over the uploaded MP4 when the host supports embedding.
- The **Project link URL** field separately creates an optional button for itch.io, an interactive film, a YouTube page, or another valid HTTP(S) link.
- Keep clips compressed. GitHub's web uploader has a 25 MB per-file limit and GitHub repos are not intended for huge raw video files. For bigger films, use an embedded video host and/or an external link.

## Files that drive the site

- `.pages.yml` — Pages CMS field definitions.
- `content/site.json` — single source for About, contact, top memories, and galleries.
- `content/projects.json` — single source for all project content.
- `home-content.js` — applies site and project fields on the homepage.
- `project-content.js` — applies project content on each project detail page.
- `index.html`, `project.css`, `project.js`, `projects/*.html` — existing visual style and page shells.
- `assets/`, `videos/` — media files.

## Offline preview and troubleshooting

The pages use `fetch()` to read their JSON files. When you open `index.html` directly from Finder (`file://`), browsers often block this kind of local file access. In that case, the original HTML placeholders remain visible; that does not mean the GitHub Pages site is broken.

**To preview current edits**, use your live GitHub Pages URL (or a local HTTP server, e.g. `python3 -m http.server 8000`).

If a Pages CMS change doesn't appear, check that it was saved on the correct branch, that your public site is updated, and then refresh the page. Use the browser Developer Tools Console/Network to check that `content/site.json` and `content/projects.json` load successfully.

If you need to undo a change, use GitHub's commit history; V19 is still available as a previous commit/ZIP.

## Placeholder notice

The images and sample videos are placeholders. The email is also currently a placeholder. Replace any public-facing placeholders before distributing the site professionally.
