import styles from './index.css?inline';

const STYLE_ID = 'rc-table-advanced-styles';

export const injectStyles = (options?: { nonce?: string }) => {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  if (options?.nonce) style.nonce = options.nonce;
  style.textContent = styles;
  document.head.appendChild(style);
};
