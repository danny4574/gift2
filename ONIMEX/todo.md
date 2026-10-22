# Website linking and hosting checklist

- [ ] Choose a hosting service, such as Vercel or Netlify.
- [x] Create a Supabase account and a new project at https://supabase.com/dashboard.
- [ ] In the new Supabase project, open the SQL Editor and run the contents of `supabase/schema.sql`.
- [x] Copy the project URL and anon/publishable key from Supabase project settings. Keep the service-role key private.
- [x] Add the Supabase values to a local `.env` file as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` so you can test the site locally.
- [x] Push the project to GitHub. Do not commit Supabase credentials.
- [ ] Connect the GitHub repository to the hosting service. Set the project root to `ONIMEX` if the repository contains that folder.
- [ ] Configure the build command as `npm run build` and the output directory as `dist`.
- [ ] Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values in the hosting service's project settings.
- [ ] Deploy the site and test the provided hosting URL, including photos, Memory Lane, and wishes.
- [ ] Configure the hosted URL in Supabase auth settings if needed.
- [ ] Add a custom domain in the hosting dashboard, then configure the DNS records at your domain registrar.
- [ ] Test the final domain on desktop and mobile, including posting a wish and refreshing the page.


