'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useTranslations } from '@/lib/i18n/locale-provider';
import { fetchMissingPersons } from '@/lib/api/missing-persons';
import {
  createLocalMissingPerson,
  findDuplicateByFingerprint,
  getLocalMissingPersons,
  mergeMissingPersonLists,
  type MissingPersonListItem,
} from '@/lib/offline/missing-persons.repository';
import { isOnline } from '@/lib/sync/client-id';
import { runSyncCycle } from '@/lib/sync/sync-engine';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { sanitizeContactInput } from '@/lib/validation/contact';
import {
  validateMissingPersonForm,
  type MissingPersonFormErrors,
} from '@/lib/validation/missing-person-form';

const DEFAULT_EMERGENCY_ID = 'ven-earthquake-2026';

interface MissingPersonFormState {
  name: string;
  age: string;
  lastKnownLocation: string;
  familyContact: string;
  physicalDescription: string;
}

const EMPTY_FORM: MissingPersonFormState = {
  name: '',
  age: '',
  lastKnownLocation: '',
  familyContact: '',
  physicalDescription: '',
};

type FeedbackTone = 'success' | 'duplicate' | 'warning';

interface FormFeedback {
  tone: FeedbackTone;
  name: string;
}

export function MissingPersonsView() {
  const t = useTranslations('missingPersons');
  const tCommon = useTranslations('common');
  const tSync = useTranslations('sync');
  const queryClient = useQueryClient();
  const online = useOnlineStatus();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MissingPersonFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<MissingPersonFormErrors>({});
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['missing-persons', DEFAULT_EMERGENCY_ID, search],
    queryFn: () => loadMissingPersonsList(DEFAULT_EMERGENCY_ID, search || undefined),
  });

  const createMutation = useMutation({
    mutationFn: async (input: MissingPersonFormState) => {
      const payload = {
        emergencyId: DEFAULT_EMERGENCY_ID,
        name: input.name.trim(),
        age: input.age ? Number(input.age) : undefined,
        lastKnownLocation: input.lastKnownLocation.trim(),
        familyContact: input.familyContact.trim() || undefined,
        physicalDescription: input.physicalDescription.trim() || undefined,
      };

      const validationErrors = validateMissingPersonForm(input);
      if (validationErrors) {
        throw validationErrors;
      }

      const existingList = await loadMissingPersonsList(DEFAULT_EMERGENCY_ID);
      if (findDuplicateByFingerprint(existingList, payload)) {
        return { name: payload.name, alreadyExists: true as const };
      }

      const { record, alreadyExists } = await createLocalMissingPerson(payload);

      if (alreadyExists) {
        return { name: record.name, alreadyExists: true as const };
      }

      if (isOnline()) {
        await runSyncCycle();
      }

      return { name: record.name, alreadyExists: false as const };
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['missing-persons'] });
      void queryClient.invalidateQueries({ queryKey: ['sync-pending'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setFeedback({
        tone: result.alreadyExists ? 'duplicate' : 'success',
        name: result.name,
      });
    },
    onError: (error) => {
      if (isFormValidationError(error)) {
        setFormErrors(error);
      }
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormErrors({});
    setFeedback(null);
    createMutation.mutate(form);
  }

  const count = data?.length ?? 0;

  return (
    <div className="space-y-8">
      {!online && (
        <InfoBanner tone="warning">{tSync('offlineBanner')}</InfoBanner>
      )}

      {feedback && (
        <InfoBanner tone={feedback.tone}>
          {feedback.tone === 'duplicate'
            ? t('alreadyRegistered', { name: feedback.name })
            : online
              ? t('registerSuccess', { name: feedback.name })
              : t('registerSuccessOffline', { name: feedback.name })}
        </InfoBanner>
      )}

      <section className="rounded-2xl border border-rl-border bg-rl-surface p-5 shadow-sm sm:p-6">
        <p className="text-sm text-rl-text-muted">{t('howItWorks')}</p>
        <p className="mt-1 text-xs text-rl-text-muted">{t('scopeNote')}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="search" className="mb-1.5 block text-sm font-semibold">
              {tCommon('search')}
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-rl-border bg-rl-bg px-4 py-3 text-base outline-none focus:border-rl-accent focus:ring-2 focus:ring-rl-accent/20"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setShowForm((prev) => !prev);
                setFeedback(null);
                setFormErrors({});
              }}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-rl-accent px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-rl-accent-hover sm:w-auto"
            >
              {showForm ? tCommon('cancel') : `+ ${t('register')}`}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 border-t border-rl-border pt-6">
            <p className="mb-4 text-sm font-semibold text-rl-navy">{t('register')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t('fields.name')}
                required
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <Field
                label={t('fields.age')}
                type="number"
                min={0}
                max={130}
                value={form.age}
                onChange={(v) => setForm((f) => ({ ...f, age: v }))}
              />
              <div className="sm:col-span-2">
                <Field
                  label={t('fields.lastKnownLocation')}
                  required
                  value={form.lastKnownLocation}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, lastKnownLocation: v }))
                  }
                />
              </div>
              <Field
                label={t('fields.familyContact')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                hint={t('fields.familyContactHint')}
                error={formErrors.familyContact ? t('contactInvalid') : undefined}
                value={form.familyContact}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    familyContact: sanitizeContactInput(v),
                  }))
                }
              />
              <Field
                label={t('fields.physicalDescription')}
                value={form.physicalDescription}
                onChange={(v) =>
                  setForm((f) => ({ ...f, physicalDescription: v }))
                }
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-rl-navy px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {createMutation.isPending ? tCommon('loading') : tCommon('save')}
            </button>
          </form>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-rl-navy">{t('listTitle')}</h2>
          {!isLoading && (
            <span className="text-sm text-rl-text-muted">
              {count === 1
                ? t('listCountOne', { count: String(count) })
                : t('listCountMany', { count: String(count) })}
            </span>
          )}
        </div>

        {isLoading && (
          <p className="text-center text-rl-text-muted">{tCommon('loading')}</p>
        )}

        {isError && (
          <div className="rounded-xl border border-rl-accent/30 bg-rl-accent-soft p-4 text-center">
            <p className="text-rl-accent">{tCommon('error')}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 text-sm font-semibold underline"
            >
              {tCommon('retry')}
            </button>
          </div>
        )}

        {!isLoading && !isError && count === 0 && (
          <div className="rounded-2xl border border-dashed border-rl-border bg-rl-surface-muted px-6 py-14 text-center">
            <p className="text-4xl" aria-hidden>
              🔍
            </p>
            <p className="mt-3 text-rl-text-muted">{t('empty')}</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm font-bold text-rl-accent hover:text-rl-accent-hover"
            >
              + {t('register')}
            </button>
          </div>
        )}

        <ul className="grid gap-4">
          {data?.map((person) => (
            <MissingPersonCard key={person.clientId ?? person.id} person={person} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function MissingPersonCard({ person }: { person: MissingPersonListItem }) {
  const t = useTranslations('missingPersons');
  const tSync = useTranslations('sync');

  const hasLiveMatch = (person.matchHints?.length ?? 0) > 0;
  const displayStatus = hasLiveMatch ? 'POSSIBLE_MATCH' : person.status;

  return (
    <li className="overflow-hidden rounded-2xl border border-rl-border bg-rl-surface shadow-sm">
      <div className="flex gap-4 p-5">
        <div
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rl-surface-muted text-xl font-bold text-rl-navy"
        >
          {person.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-rl-navy">{person.name}</h3>
            <StatusBadge status={displayStatus} />
          </div>

          <dl className="mt-3 space-y-1.5 text-sm">
            <div>
              <dt className="sr-only">{t('fields.lastKnownLocation')}</dt>
              <dd className="text-rl-text-muted">
                📍 {t('lastSeen', { location: person.lastKnownLocation })}
              </dd>
            </div>
            {person.age != null && (
              <div>
                <dt className="sr-only">{t('fields.age')}</dt>
                <dd className="text-rl-text-muted">
                  {t('fields.age')}: {person.age}
                </dd>
              </div>
            )}
            {person.familyContact && (
              <div>
                <dt className="sr-only">{t('fields.familyContact')}</dt>
                <dd className="font-medium text-rl-text">
                  📞 {person.familyContact}
                </dd>
              </div>
            )}
          </dl>

          {person.syncStatus !== 'SYNCED' && (
            <p className="mt-3 text-xs font-semibold text-rl-warning">
              {tSync(`syncStatus.${person.syncStatus}`)}
            </p>
          )}

          {hasLiveMatch && (
            <div className="mt-3 space-y-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              <p className="font-semibold">{t('possibleMatchTitle')}</p>
              <ul className="space-y-1">
                {person.matchHints!.map((hint) => (
                  <li key={hint.candidateId}>
                    {t('possibleMatchWith', {
                      name: hint.candidateName,
                      reasons: hint.reasons.join(' · '),
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('missingPersons');

  const styles: Record<string, string> = {
    SEARCHING: 'bg-sky-100 text-sky-800',
    POSSIBLE_MATCH: 'bg-amber-100 text-amber-900',
    FOUND: 'bg-green-100 text-green-800',
    REUNITED: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] ?? 'bg-rl-surface-muted text-rl-text-muted'}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

function InfoBanner({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: FeedbackTone | 'warning';
}) {
  const classes =
    tone === 'success'
      ? 'border-green-200 bg-green-50 text-green-900'
      : tone === 'duplicate'
        ? 'border-sky-200 bg-sky-50 text-sky-900'
        : 'border-amber-200 bg-amber-50 text-amber-900';

  return (
    <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${classes}`}>
      {children}
    </div>
  );
}

function isFormValidationError(
  error: unknown,
): error is MissingPersonFormErrors {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('familyContact' in error || 'name' in error)
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  inputMode,
  autoComplete,
  hint,
  error,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  hint?: string;
  error?: string;
  min?: number;
  max?: number;
}) {
  const inputId = label.replace(/\s+/g, '-').toLowerCase();

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-semibold text-rl-text">
        {label}
        {required && <span className="text-rl-accent"> *</span>}
      </span>
      {hint && (
        <span className="mb-1.5 block text-xs text-rl-text-muted">{hint}</span>
      )}
      <input
        id={inputId}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full rounded-xl border bg-rl-bg px-4 py-3 text-base outline-none focus:ring-2 ${
          error
            ? 'border-rl-accent focus:border-rl-accent focus:ring-rl-accent/20'
            : 'border-rl-border focus:border-rl-accent focus:ring-rl-accent/20'
        }`}
      />
      {error && (
        <span id={`${inputId}-error`} className="mt-1.5 block text-xs text-rl-accent">
          {error}
        </span>
      )}
    </label>
  );
}

async function loadMissingPersonsList(
  emergencyId: string,
  search?: string,
): Promise<MissingPersonListItem[]> {
  const local = await getLocalMissingPersons(emergencyId, search);

  if (!isOnline()) {
    return mergeMissingPersonLists([], local);
  }

  try {
    const remote = await fetchMissingPersons({
      emergencyId,
      search,
    });
    return mergeMissingPersonLists(remote, local);
  } catch {
    return mergeMissingPersonLists([], local);
  }
}
