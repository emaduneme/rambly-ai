import 'aos/dist/aos.css';
import './styles.css';
import AOS from 'aos';
import { loadAnalytics } from './analytics';
import { initSignupForm } from './form';
import { initVideo } from './video';

loadAnalytics(import.meta.env.VITE_UMAMI_WEBSITE_ID);

// Scroll-in animations, with the template's settings.
AOS.init({ once: true, disable: 'phone', duration: 700, easing: 'ease-out-cubic' });

const step2 = document.querySelector<HTMLElement>('[data-step2]');
if (step2) {
    document.querySelectorAll<HTMLFormElement>('form[data-signup]').forEach((form) => initSignupForm(form, step2));
}
document.querySelectorAll<HTMLButtonElement>('button[data-video]').forEach(initVideo);
