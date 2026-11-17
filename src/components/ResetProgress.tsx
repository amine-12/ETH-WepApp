import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProgress } from '../context/ProgressContext';

function ResetDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    cancel.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<dialog ref={dialog} className="analytics-consent-dialog reset-progress-dialog" aria-labelledby="reset-progress-title" aria-describedby="reset-progress-description" onCancel={event => { event.preventDefault(); onCancel(); }} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons?.length) return;
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }}>
    <div className="analytics-choice">
      <h2 id="reset-progress-title">Réinitialiser votre progression ?</h2>
      <p id="reset-progress-description">Les modules terminés, les positions de lecture, les réponses, les résultats des activités et le dernier score du quiz seront effacés de ce navigateur. Cette action est irréversible.</p>
      <p>Les statistiques déjà envoyées sont conservées. Votre choix concernant les statistiques facultatives reste inchangé. Si la collecte est active, votre prochain parcours sera enregistré dans une nouvelle session.</p>
      <div className="button-row">
        <button ref={cancel} className="button secondary" onClick={onCancel}>Annuler</button>
        <button className="button danger" onClick={onConfirm}>Réinitialiser</button>
      </div>
    </div>
  </dialog>, document.body);
}

export function ResetProgress() {
  const { resetProgress, storageAvailable } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [reset, setReset] = useState(false);
  return <section className="progress-reset" aria-labelledby="progress-reset-heading">
    <h2 id="progress-reset-heading">Repartir de zéro</h2>
    <p>Effacez votre progression sur ce navigateur pour recommencer les modules, les activités et le quiz.</p>
    <button className="button secondary" onClick={() => setConfirming(true)}>Réinitialiser ma progression</button>
    {reset && <p role="status">{storageAvailable ? 'Votre progression a été réinitialisée. Vous pouvez commencer un nouveau parcours.' : 'Votre progression a été réinitialisée pour cette visite, mais la réinitialisation n’a pas pu être enregistrée dans ce navigateur.'}</p>}
    {confirming && <ResetDialog onCancel={() => setConfirming(false)} onConfirm={() => {
      resetProgress();
      setReset(true);
      setConfirming(false);
    }} />}
  </section>;
}
