/** Адрес сайта: на Vercel — основной домен проекта, иначе vormik.vercel.app. */
export const SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "vormik.vercel.app"}`;
