# EasyGDS Homepage Offers

This is a self-contained package for the EasyGDS Homepage Offers landing page.

## Contents
- `index.html`: The main homepage file (formerly `13_homepage_offers.html`).
- `homepage_logic_integrated.js`: Integrated JavaScript logic for the page.
- `images/`: Directory containing local image assets.

## Deployment on AWS Amplify

You can deploy this static site to AWS Amplify using one of the following methods:

### Option 1: Deploy from Git (Recommended)
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
3. Navigate to **AWS Amplify**.
4. Click **"New app"** -> **"Host web app"**.
5. Select your Git provider (e.g., GitHub) and click **Continue**.
6. Authorize AWS Amplify to access your repository.
7. Select the repository and branch you just pushed.
8. **Build Settings**: Amplify should automatically detect this as a static web app.
   - If prompted for a build command, leave it blank (or `echo "Done"`).
   - Ensure the **Base directory** is set to `/` (root).
9. Click **"Save and deploy"**.

### Option 2: Drag and Drop (Manual Deployment)
1. Zip the contents of this folder (select all files -> Right Click -> Send to -> Compressed (zipped) folder).
   - *Note: Ensure you zip the files themselves, not the parent folder.*
2. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
3. Navigate to **AWS Amplify**.
4. Click **"New app"** -> **"Host web app"**.
5. Select **"Deploy without Git provider"**.
6. Click **Continue**.
7. In the **"Start a deployment"** box, give your app a name and environment name (e.g., `dev` or `prod`).
8. Drag and drop your zip file into the upload area.
9. Click **"Save and deploy"**.

## Local Development
To view the site locally, simply open `index.html` in your web browser.
