import styles from './ProtectedHomePage.module.css';

export function ProtectedHomePage() {
  return (
    <section aria-labelledby="protected-home-heading" className={styles.panel}>
      <p className={styles.eyebrow}>Empty shell</p>
      <h2 className={styles.heading} id="protected-home-heading">
        Auth foundation ready for bookmark features
      </h2>
      <p className={styles.body}>
        Google OAuth, persisted sessions, and protected shell access now replace the placeholder
        auth seam from FAV-21.
      </p>
      <div className={styles.statusRow}>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Session</span>
          <strong className={styles.statusValue}>Protected</strong>
        </div>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Theme</span>
          <strong className={styles.statusValue}>Persisted runtime toggle</strong>
        </div>
      </div>
    </section>
  );
}
