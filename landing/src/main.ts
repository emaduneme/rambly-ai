import './styles.css';
import { loadAnalytics } from './analytics';
import { initSignupForm } from './form';
import { initVideo } from './video';

loadAnalytics(import.meta.env.VITE_UMAMI_WEBSITE_ID);

const step2 = document.querySelector<HTMLElement>('[data-step2]');
if (step2) {
    document.querySelectorAll<HTMLFormElement>('form[data-signup]').forEach((form) => initSignupForm(form, step2));
}
document.querySelectorAll<HTMLButtonElement>('button[data-video]').forEach(initVideo);
