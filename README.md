# Study Summaries Website

A simple website where students can browse courses and open or download PDF / PPTX summaries.

## How to publish it (one time, about 10 minutes)

1. Create a free account at https://github.com
2. Click **+** (top right) > **New repository**. Name it `summaries`, set it to **Public**, click **Create repository**.
3. Click **uploading an existing file**, then drag in **everything inside this folder** (including the `files` folder and the hidden `.github` folder), and click **Commit changes**.
   - If the `.github` folder does not upload by drag and drop, see "If .github is missing" below.
4. Go to **Settings > Pages**. Under **Source**, choose **GitHub Actions**.
5. Go to the **Actions** tab and wait for "Publish website" to turn green (1 to 2 minutes).
6. Your link is: `https://YOUR-USERNAME.github.io/summaries/`. Send it to your friends.

## How to add a summary

1. Open your repository > `files` > the course folder (for example `anatomy-1`).
2. Click **Add file > Upload files**, drop your PDF or PPTX, and click **Commit changes**.
3. Wait about 1 minute. The file appears on the website automatically.

### Optional: sections inside a course
Make a folder inside the course folder, for example `files/anatomy-1/Practical/`. Files inside it show under a heading called "Practical". Files placed directly in the course folder show under "Summaries".

## Changing course names or instructors
Edit `courses.js` on GitHub (click the file, then the pencil icon).

## If .github is missing
In your repository click **Add file > Create new file**, type `.github/workflows/deploy.yml` as the name, paste the contents of that file from this folder, and commit.
