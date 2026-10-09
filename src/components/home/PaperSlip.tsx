import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import styles from './HomeDesk.module.css';

export function PaperSlip({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className={styles.slip}>
      <div className={styles.plateFrame} aria-hidden="true">
        <div className={styles.plate} />
      </div>
      <div className={styles.body}>
        {title ? <h2 className={styles.slipTitle}>{title}</h2> : null}
        {children}
      </div>
    </section>
  );
}

export function SlipOrCard({
  paper = false,
  title,
  children,
}: {
  paper?: boolean;
  title?: string;
  children: ReactNode;
}) {
  if (paper) return <PaperSlip title={title}>{children}</PaperSlip>;
  return <Card title={title}>{children}</Card>;
}
