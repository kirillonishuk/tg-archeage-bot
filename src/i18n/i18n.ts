import i18next from 'i18next';
import Backend from 'i18next-node-fs-backend';
import path from 'path';

i18next
  .use(Backend)
  .init({
    lng: 'ru',
    fallbackLng: 'ru',
    supportedLngs: ['ru'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: path.resolve(__dirname, 'locales/{{lng}}/{{ns}}.json')
    }
  });

export default i18next;