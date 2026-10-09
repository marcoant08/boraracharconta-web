import { ReactNode } from 'react';
import styles from './HomeDesk.module.css';

export function PaperSlip({ children }: { children: ReactNode }) {
  return (
    <section className={styles.slip}>
      <img className={styles.plate} src="/assets/plates/slip-card.png" alt="" />
      <div className={styles.body}>{children}</div>
    </section>
  );
}
