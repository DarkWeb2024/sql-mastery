import { Link, useParams } from 'react-router-dom';
import { useProgress } from '../progress/store';

// Verification is local to this device because there is no backend. The page
// confirms whether a certificate ID exists in this browser's records and is
// honest about that scope.
export function VerifyPage() {
  const { id = '' } = useParams();
  const certificates = useProgress((s) => s.certificates);
  const cert = certificates.find((c) => c.id === id);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Certificate verification</h1>
      <p className="font-mono text-sm text-slate-500">{id}</p>

      {cert ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-700 dark:bg-emerald-950/30">
          <p className="font-semibold text-emerald-800 dark:text-emerald-200">Valid certificate</p>
          <dl className="mt-3 space-y-1 text-sm">
            <Row label="Name" value={cert.name} />
            <Row label="Score" value={`${cert.score} / ${cert.total}`} />
            <Row label="Issued" value={new Date(cert.issuedAt).toLocaleString()} />
          </dl>

          {cert.competencies && cert.competencies.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Competency breakdown
              </p>
              <ul className="mt-2 space-y-1.5">
                {cert.competencies.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm">
                    <span className="w-28 shrink-0">{c.label}</span>
                    <span className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                      <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${c.score}%` }} />
                    </span>
                    <span className="w-10 text-right">{c.score}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cert.skills && cert.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Skills demonstrated
              </p>
              <p className="mt-1 text-sm">{cert.skills.join(', ')}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950/30">
          <p className="text-amber-800 dark:text-amber-200">
            No certificate with this ID was found in this browser's records.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Certificates are stored locally on the device where the exam was taken, so verification works
        on that device.
      </p>
      <Link to="/dashboard" className="text-brand-600 hover:underline">
        Back to the dashboard
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
