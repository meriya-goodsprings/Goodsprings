/**
 * GOODSPRINGS — Configuration
 * 
 * 1. Создай бесплатный проект на https://supabase.com
 * 2. В Project Settings → API скопируй:
 *    - Project URL
 *    - anon public key
 * 3. Вставь их ниже
 * 4. Выполни SQL из файла SETUP.sql в SQL Editor Supabase
 * 5. Залей сайт на Netlify заново
 */

const GS_CONFIG = {
  // ← СЮДА ВСТАВЬ СВОИ ДАННЫЕ ИЗ SUPABASE
  SUPABASE_URL: 'https://tobbwaaalrxhjoxoupuw.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_ThVOiWUmTeXSvxWKjZ6gew_A9noJ7WB',

  // Пароль админки (хранится только в браузере, для входа в панель)
  // Настоящая защита данных — через Supabase RLS / сервисный ключ при необходимости
  ADMIN_PASSWORD: 'iba006'
};