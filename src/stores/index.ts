import { format } from 'cl-sql-formatter';
import _ from 'lodash';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { parseObj } from '../lib/utils';

type State = {
  databases: string[];
  collections: string[];
  database: string;
  collection: string;
  stages: Stage[];
  query: string;
  data: any[] | null;
  error: string | null;

  setDatabases: (databases: string[]) => void;
  setCollections: (collections: string[]) => void;
  setDatabase: (database: string) => void;
  setCollection: (collection: string) => void;
  setStages: (stages: Stage[]) => void;
  setQuery: (query: string) => void;
  setData: (data: any[]) => void;
  setError: (error: string | null) => void;

  loadDatabases: () => Promise<void>;
  loadCollections: () => Promise<void>;
  convert: () => Promise<void>;
  run: () => Promise<void>;
};

export type Stage = {
  name: string;
  value: string;
  expanded: boolean;
  enabled: boolean;
  error: string | null;
};

export const DEFAULT_STAGES = [
  { name: '$match', value: '{}', expanded: false, enabled: false, error: null },
  { name: '$group', value: '{}', expanded: false, enabled: false, error: null },
  {
    name: '$project',
    value: '{}',
    expanded: false,
    enabled: false,
    error: null,
  },
  { name: '$sort', value: '{}', expanded: false, enabled: false, error: null },
];

async function postUrl(url: string, data: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await res.json();
}

async function getUrl(url: string) {
  const res = await fetch(url);
  return await res.json();
}

const useStore = create<State>()(
  devtools(
    persist((set, get) => ({
      /** Members */
      database: '',
      collection: '',
      databases: [],
      collections: [],
      stages: DEFAULT_STAGES,
      query: '',
      data: null,
      error: null,

      /** Setters */
      setDatabases: (databases: string[]) => set(() => ({ databases })),
      setCollections: (collections: string[]) => set(() => ({ collections })),
      setDatabase: (database: string) => set(() => ({ database })),
      setCollection: (collection: string) => set(() => ({ collection })),
      setStages: (stages: Stage[]) => set(() => ({ stages })),
      setQuery: (query: string) => set(() => ({ query })),
      setData: (data: any[]) => set(() => ({ data })),
      setError: (error: string | null) => set(() => ({ error })),

      /** API calls */
      loadDatabases: async () => {
        const { database } = get();
        let { databases } = await getUrl('/api/databases');
        if (!databases) return;
        const filteredDatabases = databases.filter(
          (db: string) => db !== 'public',
        );
        set({ databases: filteredDatabases });
        if (database === '') {
          set({ database: filteredDatabases[0] });
        }
      },

      loadCollections: async () => {
        const { database, collection } = get();

        if (!database) return;
        let { collections } = await getUrl(
          `/api/databases/${database}/collections`,
        );
        set({ collections });
        if (collection === '') {
          set({ collection: collections[0] });
        }
      },

      convert: async () => {
        const { stages, database, collection } = get();
        let pipeline = [];

        for (const stage of stages) {
          if (
            (stage.name === '$match' || stage.value !== '{}') &&
            !_.isEmpty(stage.value)
          ) {
            pipeline.push({ [stage.name]: parseObj(stage.value) });
          }
        }

        const data: any = await postUrl('/api/convert', {
          database,
          collection,
          pipeline,
        });
        if (data.error) {
          set({ error: data.error });
          return;
        }
        set({ query: format(data.sql, { language: 'postgresql' }) });
      },

      run: async () => {
        const { query } = get();
        const data: any = await postUrl('/api/run', { query });
        if (data.error) {
          set({ error: data.error });
          return;
        }
        set({ data: data.rows });
      },
    })),
  ),
);

export default useStore;