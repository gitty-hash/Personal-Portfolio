# Sharaan Thayanithi: portfolio site

Plain HTML, CSS and JavaScript. No build step, no dependencies. The only outside request is Google Fonts.

```
portfolio/
  index.html      all content and sections
  style.css       design tokens (dark and light themes) and layout
  script.js       theme toggle, typing effect, neural-network canvas, scroll reveal, menu, contact form
  assets/
    headshot.jpg
    pawsconnect.jpg
    Sharaan_Thayanithi_Resume.pdf
```

## Run it locally

From inside the `portfolio` folder:

```
python -m http.server 5173
```

Then open http://localhost:5173. (Opening `index.html` directly also works, but a local server matches how GitHub Pages serves it.)

## Make the contact form send you email (free, 2 minutes)

The form works out of the box by opening the visitor's email app. To receive messages directly instead:

1. Sign up free at https://formspree.io and create a new form that delivers to your email.
2. Copy the form ID from its endpoint (`https://formspree.io/f/abcdwxyz` gives the ID `abcdwxyz`).
3. In `index.html`, find `YOUR_FORM_ID` (in the `<form id="contact-form">` tag) and replace it with your ID.

No other change is needed. Test it once after you deploy.

## Deploy to GitHub Pages (free)

Best URL: name the repository exactly `gitty-hash.github.io`, which gives you https://gitty-hash.github.io.

1. On GitHub, create a new **public** repository named `gitty-hash.github.io` (leave it empty).
2. In a terminal, from inside the `portfolio` folder:

```
git init
git add .
git commit -m "Add portfolio site"
git branch -M main
git remote add origin https://github.com/gitty-hash/gitty-hash.github.io.git
git push -u origin main
```

3. On GitHub, open the repo, then **Settings > Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, then Save.
4. Wait about a minute, then visit https://gitty-hash.github.io.

To update the site later, edit the files and run `git add .`, `git commit -m "Update"`, `git push`.

## Things to keep current

- **Resume:** replace `assets/Sharaan_Thayanithi_Resume.pdf` (keep the filename, or update the two links in `index.html`).
- **PawsConnect demo:** when it is deployed, add a "Live demo" button next to the GitHub button, the same way TimeTrack has one.
- **Phone number and email** are in the Contact section of `index.html`.
- **Theme colours** are the variables at the top of `style.css`. Change `--accent` and `--accent-2` to restyle the whole site (keep text contrast at 4.5:1 or higher).
