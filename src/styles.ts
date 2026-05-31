import styles from './index.css?inline';

const STYLE_ID = 'rc-table-advanced-styles';

export const injectStyles = () => {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = styles;
  document.head.appendChild(style);
};
