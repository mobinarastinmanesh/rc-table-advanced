import type { BaseFiltersState } from '../table/components/filters';
import type { TableFieldValue } from '../table/table.type';

export type DemoRecord = {
  id: number;
  name: TableFieldValue<string>;
  status: string;
  priority: string;
  tags: string[];
  amount: number;
  createdAt: string;
};

export type DemoFilters = BaseFiltersState & {
  status?: string;
  priority?: string;
  receivers?: string[];
  tags?: string[];
  amount?: { min?: number; max?: number };
  createdAt?: string;
  createdRange?: { from?: string; to?: string };
};

const receiverNames = [
  'Jane Cooper',
  'Cody Fisher',
  'Esther Howard',
  'Wade Warren',
  'Jenny Wilson',
  'Robert Fox',
  'Leslie Alexander',
  'Brooklyn Simmons',
  'Courtney Henry',
  'Jacob Jones',
  'Annette Black',
  'Darlene Robertson',
];

const receiverSlugs = ['jane', 'cody', 'esther'] as const;

const buildTags = (id: number): string[] => {
  const tags: string[] = [];
  if (id % 4 === 0) tags.push('vip');
  if (id % 5 === 0) tags.push('refund');
  if (id % 7 === 0) tags.push('manual-review');
  return tags;
};

export const demoRecords: DemoRecord[] = Array.from({ length: 42 }, (_, index) => {
  const id = index + 1;
  const isInvalid = id % 9 === 2;

  return {
    id,
    name: {
      value: isInvalid
        ? `Invalid receiver ${id}`
        : receiverNames[index % receiverNames.length],
      isValid: !isInvalid,
      message: isInvalid ? 'Receiver name is incomplete' : undefined,
    },
    status: id % 3 === 0 ? 'draft' : 'paid',
    priority: id % 3 === 0 ? 'high' : id % 2 === 0 ? 'normal' : 'low',
    tags: buildTags(id),
    amount: 25 + id * 13,
    createdAt: `2025/${String((id % 12) + 1).padStart(2, '0')}/${String((id % 28) + 1).padStart(2, '0')}`,
  };
});

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
        item.name.value,
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
    result = result.filter((item) => {
      const slug = receiverSlugs.find((entry) =>
        item.name.value?.toLowerCase().includes(entry),
      );
      return slug ? filters.receivers?.includes(slug) : false;
    });
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
