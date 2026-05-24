import type { ReactNode } from 'react';
import type { TableFieldValue } from 'rc-table-advanced';

export type DemoLocale = 'en' | 'fa';

export type DemoReceiver = {
  slug: string;
  en: string;
  fa: string;
};

export const demoReceivers: DemoReceiver[] = [
  { slug: 'narges', en: 'Jane Cooper', fa: 'نرگس احمدی' },
  { slug: 'arsh', en: 'Cody Fisher', fa: 'آرش رضایی' },
  { slug: 'sara', en: 'Esther Howard', fa: 'سارا موسوی' },
  { slug: 'amir', en: 'Wade Warren', fa: 'امیرحسین کریمی' },
  { slug: 'maryam', en: 'Jenny Wilson', fa: 'مریم حسینی' },
  { slug: 'parisa', en: 'Robert Fox', fa: 'پریسا نوری' },
  { slug: 'kian', en: 'Leslie Alexander', fa: 'کیان صادقی' },
];

export type DemoRecord = {
  id: number;
  receiverSlug: string;
  name: TableFieldValue<string>;
  status: string;
  priority: string;
  tags: string[];
  amount: number;
  createdAt: string;
};

export type DemoFilters = {
  query?: string;
  sort?: string;
  status?: string;
  priority?: string;
  receivers?: string[];
  tags?: string[];
  amount?: { min?: number; max?: number };
  createdAt?: string;
  createdRange?: { from?: string; to?: string };
};

const filterReceiverSlugs = ['narges', 'arsh', 'sara'] as const;

export const getReceiverBySlug = (slug: string) =>
  demoReceivers.find((item) => item.slug === slug);

export const getReceiverDisplayName = (
  record: DemoRecord,
  locale: DemoLocale,
): string => {
  if (record.name.isValid === false) {
    return locale === 'fa'
      ? `گیرنده نامعتبر ${record.id}`
      : String(record.name.value);
  }

  const receiver = getReceiverBySlug(record.receiverSlug);
  if (!receiver) return String(record.name.value);

  return locale === 'fa' ? receiver.fa : receiver.en;
};

export const getReceiverErrorMessage = (
  record: DemoRecord,
  locale: DemoLocale,
): ReactNode | undefined => {
  if (record.name.isValid !== false) return undefined;
  return locale === 'fa' ? 'نام گیرنده ناقص است' : record.name.message;
};

const buildTags = (id: number): string[] => {
  const tags: string[] = [];
  if (id % 4 === 0) tags.push('vip');
  if (id % 5 === 0) tags.push('refund');
  if (id % 7 === 0) tags.push('manual-review');
  return tags;
};

export const demoRecords: DemoRecord[] = Array.from(
  { length: 42 },
  (_, index) => {
    const id = index + 1;
    const isInvalid = id % 9 === 2;
    const receiver = demoReceivers[index % demoReceivers.length];

    return {
      id,
      receiverSlug: receiver.slug,
      name: {
        value: isInvalid ? `Invalid receiver ${id}` : receiver.en,
        isValid: !isInvalid,
        message: isInvalid ? 'Receiver name is incomplete' : undefined,
      },
      status: id % 3 === 0 ? 'draft' : 'paid',
      priority: id % 3 === 0 ? 'high' : id % 2 === 0 ? 'normal' : 'low',
      tags: buildTags(id),
      amount: 25 + id * 13,
      createdAt: `2025/${String((id % 12) + 1).padStart(2, '0')}/${String((id % 28) + 1).padStart(2, '0')}`,
    };
  },
);

export const filterDemoRecords = (
  data: DemoRecord[],
  filters: DemoFilters,
): DemoRecord[] => {
  let result = data;

  const query = filters.query?.trim().toLowerCase();
  if (query) {
    result = result.filter((item) =>
      [
        item.id,
        getReceiverDisplayName(item, 'en'),
        getReceiverDisplayName(item, 'fa'),
        item.status,
        item.priority,
        item.amount,
        item.tags.join(' '),
      ].some((field) => String(field).toLowerCase().includes(query)),
    );
  }

  if (filters.status) {
    result = result.filter((item) => item.status === filters.status);
  }

  if (filters.priority) {
    result = result.filter((item) => item.priority === filters.priority);
  }

  if (filters.receivers?.length) {
    result = result.filter((item) =>
      filters.receivers!.includes(item.receiverSlug),
    );
  }

  if (filters.tags?.length) {
    result = result.filter((item) =>
      filters.tags!.some((tag) => item.tags.includes(tag)),
    );
  }

  if (filters.amount?.min !== undefined) {
    result = result.filter((item) => item.amount >= filters.amount!.min!);
  }

  if (filters.amount?.max !== undefined) {
    result = result.filter((item) => item.amount <= filters.amount!.max!);
  }

  if (filters.createdAt) {
    result = result.filter((item) => item.createdAt === filters.createdAt);
  }

  if (filters.createdRange?.from || filters.createdRange?.to) {
    result = result.filter((item) => {
      const date = item.createdAt;
      if (filters.createdRange?.from && date < filters.createdRange.from) {
        return false;
      }
      if (filters.createdRange?.to && date > filters.createdRange.to) {
        return false;
      }
      return true;
    });
  }

  const sort = filters.sort ?? 'newest';
  result = [...result].sort((left, right) =>
    sort === 'oldest' ? left.id - right.id : right.id - left.id,
  );

  return result;
};

/** Slugs used in filter schema (first three receivers). */
export const filterableReceiverSlugs = filterReceiverSlugs;
