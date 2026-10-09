import Link from 'next/link';
import styles from './LandingSplit.module.css';

const people = [
  'Ana R$ 86,40 (burger)',
  'Bruno R$ 92,10 (filé)',
  'Caio R$ 74,20 (bebidas)',
  'Diana R$ 93,20 (filé e bebida)',
];

export function LandingSplit() {
  return (
    <main className={styles.frame}>
      <img className="sr-only" src="/assets/plates/paper.png" alt="" />
      <div className={styles.comanda}>
        <figure className={`${styles.plate} ${styles.slipCard}`}>
          <img src="/assets/plates/slip-card.png" alt="" />
        </figure>
        <figure className={`${styles.plate} ${styles.friends}`}>
          <img
            src="/friends.PNG"
            alt="Quatro amigos à mesa, cada um com o próprio valor no celular."
          />
        </figure>
        <p className={styles.slipTitle}>RACHA CONTA</p>
        <div className={styles.slipItems}>
          <p>2x Burger</p>
          <p>1x Filé</p>
          <p>4x Bebidas</p>
        </div>
        <div className={styles.slipPeople}>
          {people.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <Link className={styles.codeLink} href="/bills/code">
          Ver por código
        </Link>
      </div>
      <p className={styles.wordmark}>racha conta</p>
      <h1 className={styles.headline}>Monte a conta pelo que cada um consumiu</h1>
      <div className={styles.subcopy}>
        <p>Marque o consumo, a presença e a taxa.</p>
        <p>Compartilhe o código para os outros verem.</p>
      </div>
      <Link className={styles.create} href="/login">
        Entrar e criar
      </Link>
    </main>
  );
}
