'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as Sentry from '@sentry/nextjs';
import { RootState } from '@/store/store';
import { useSearchParams } from 'next/navigation';

export function SentryContextSync() {
  const currencyCode = useSelector((state: RootState) => state.ui.currency.code);
  const searchParams = useSearchParams();

  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('perPage') || '10';

  useEffect(() => {
    // Set global tag for all subsequent Sentry events
    Sentry.setTag("currency", currencyCode);

    // Add a breadcrumb so we can see when the currency was changed in the event timeline
    Sentry.addBreadcrumb({
      category: 'ui.currency',
      message: `Currency changed to ${currencyCode}`,
      level: 'info',
    });

  }, [currencyCode]);

  useEffect(() => {
    // Sync pagination to tags for easy filtering
    Sentry.setTag("page", page);
    Sentry.setTag("per_page", perPage);

    Sentry.addBreadcrumb({
      category: 'ui.navigation',
      message: `Navigated to page ${page} (show: ${perPage})`,
      level: 'info',
    });
  }, [page, perPage]);

  return null;
}
