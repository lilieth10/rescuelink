'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from '@/lib/i18n/locale-provider';
import { FormEvent, useState } from 'react';
import {
  createMissingPerson,
  fetchMissingPersons,
  type MissingPerson,
} from '@/lib/api/missing-persons';
import { getClientId } from '@/lib/sync/client-id';

const DEFAULT_EMERGENCY_ID = 'ven-earthquake-2026';

export function MissingPersonsView() {
  const t = useTranslations('missingPersons');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    lastKnownLocation: '',
    familyContact: '',
    physicalDescription: '',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['missing-persons', DEFAULT_EMERGENCY_ID, search],
    queryFn: () =>
      fetchMissingPersons({
        emergencyId: DEFAULT_EMERGENCY_ID,
        search: search || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createMissingPerson,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['missing-persons'] });
      setShowForm(false);
      setForm({
        name: '',
        age: '',
        lastKnownLocation: '',
        familyContact: '',
        physicalDescription: '',
      });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createMutation.mutate({
      emergencyId: DEFAULT_EMERGENCY_ID,
      name: form.name,
      age: form.age ? Number(form.age) : undefined,
      lastKnownLocation: form.lastKnownLocation,
      familyContact: form.familyContact || undefined,
      physicalDescription: form.physicalDescription || undefined,
      clientId: getClientId(),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            {tCommon('search')}
          </label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border border-rl-border bg-rl-surface px-4 py-3 text-base shadow-sm outline-none transition focus:border-rl-accent focus:ring-2 focus:ring-rl-accent/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-rl-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rl-accent-hover"
        >
          {t('register')}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-rl-border bg-rl-surface p-5 shadow-sm sm:p-6"
        >
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
              value={form.familyContact}
              onChange={(v) => setForm((f) => ({ ...f, familyContact: v }))}
            />
            <Field
              label={t('fields.physicalDescription')}
              value={form.physicalDescription}
              onChange={(v) =>
                setForm((f) => ({ ...f, physicalDescription: v }))
              }
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex min-h-11 items-center rounded-xl bg-rl-navy px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {createMutation.isPending ? tCommon('loading') : tCommon('save')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex min-h-11 items-center rounded-xl border border-rl-border px-5 py-2.5 text-sm font-semibold text-rl-text-muted"
            >
              {tCommon('cancel')}
            </button>
          </div>
        </form>
      )}

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

      {!isLoading && !isError && data?.length === 0 && (
        <p className="rounded-xl border border-dashed border-rl-border bg-rl-surface-muted px-6 py-12 text-center text-rl-text-muted">
          {t('empty')}
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {data?.map((person) => (
          <MissingPersonCard key={person.id} person={person} />
        ))}
      </ul>
    </div>
  );
}

function MissingPersonCard({ person }: { person: MissingPerson }) {
  const t = useTranslations('missingPersons');

  return (
    <li className="rounded-2xl border border-rl-border bg-rl-surface p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-rl-navy">{person.name}</h3>
        <span className="shrink-0 rounded-full bg-rl-accent-soft px-2.5 py-1 text-xs font-bold text-rl-accent">
          {t(`status.${person.status}`)}
        </span>
      </div>
      <p className="text-sm text-rl-text-muted">
        {t('lastSeen', { location: person.lastKnownLocation })}
      </p>
      {person.age != null && (
        <p className="mt-1 text-sm text-rl-text-muted">
          {t('fields.age')}: {person.age}
        </p>
      )}
      {person.familyContact && (
        <p className="mt-2 text-sm font-medium text-rl-text">
          {t('fields.familyContact')}: {person.familyContact}
        </p>
      )}
    </li>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-rl-text">
        {label}
        {required && <span className="text-rl-accent"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-rl-border bg-rl-bg px-4 py-3 text-base outline-none transition focus:border-rl-accent focus:ring-2 focus:ring-rl-accent/20"
      />
    </label>
  );
}
