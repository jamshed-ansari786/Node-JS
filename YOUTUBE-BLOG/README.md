# Blogify

A server-rendered blog application built with Node.js, Express, MongoDB, Mongoose, and EJS.

## Features

- Browse published posts and open a full post page.
- Create an account, sign in, and sign out.
- Create posts with an optional cover image.
- Add an image description that is displayed as a caption and accessible alt text.
- Comment on posts while signed in; comments display the author's name only.
- Reply to comments while signed in; replies show the replier's name.
- Delete your own comments and replies; comment authors can moderate replies in their thread, and post authors or admins can moderate all comments and replies on the post.
- Edit or delete posts only as their author.
- Validate post and account data on the server.
- Limit cover uploads to JPEG, PNG, WebP, or GIF files up to 5 MB.

## Run locally

1. Install Node.js and start a local MongoDB server.
2. Install project dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long, random `JWT_SECRET`.
4. Start the app:

   ```sh
   npm run dev
   ```

5. Open `http://localhost:8000`.

Set `PORT` in `.env` to use a different port. In production, set `NODE_ENV=production` so the authentication cookie is marked `Secure`.
