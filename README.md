# WorkScholar - Vercel Deployment

This is the Vercel-ready version of the WorkScholar project, configured to work with Supabase as the database backend.

## Prerequisites

- A Supabase account and project
- A Vercel account
- The Vercel CLI (optional, for local testing)

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to 'False' in production

## Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```bash
   python manage.py migrate
   ```

3. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Deploying to Vercel

1. Push your code to GitHub

2. Connect your GitHub repository to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Python" as the framework

3. Configure the build settings:
   - Build Command: `pip install -r requirements.txt`
   - Output Directory: `staticfiles`
   - Install Command: `pip install -r requirements.txt`

4. Add environment variables in Vercel:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from your `.env` file

5. Deploy:
   - Vercel will automatically deploy your application
   - Any push to the main branch will trigger a new deployment

## Database Migrations

After deploying, you need to run migrations on your Supabase database. You can do this by:

1. Installing the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Run migrations:
   ```bash
   vercel run python manage.py migrate
   ```

## Important Notes

1. Static files are served using WhiteNoise
2. Debug mode is disabled by default in production
3. Make sure your Supabase database is in the same region as your Vercel deployment for better performance

## Security

- Never commit `.env` files to version control
- Keep your Supabase credentials secure
- Regularly update dependencies
- Monitor your application logs in Vercel
