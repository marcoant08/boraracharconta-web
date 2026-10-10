import Link from 'next/link';
import styles from './LandingSplit.module.css';

export function LandingSplit() {
  return (
    <main className={styles.frame}>
      <img className="sr-only" src="/assets/plates/paper.png" alt="" />
      <figure className={styles.friends}>
        <img
          src="/friends.PNG"
          alt="Quatro amigos à mesa, cada um com o próprio valor no celular."
        />
      </figure>
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
