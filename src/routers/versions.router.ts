import { Router } from 'express';
import { versionsController } from '../controllers';

const router = Router();

const files: readonly (keyof ReadonlyTuples)[] = ['spreadsheet', 'form'] as const;

const formMetadataKeys = ['firstEntryForEvent', 'firstEntryForSpecialGoods', 'additionalEntryForEvent', 'additionalEntryForSpecialGoods'] as const;
const spreadsheetMetadataKeys = ['users', 'entries', 'purchases', 'deliveries', 'others'] as const;

// 파일 추가 되면 keys와 함께 작성
interface ReadonlyTuples {
  spreadsheet: typeof spreadsheetMetadataKeys;
  form: typeof formMetadataKeys;
}

interface MetadataTypes<T extends keyof ReadonlyTuples> {
  keys: ReadonlyTuples[T];
  metadata: {
    [K in ReadonlyTuples[T][number]]: {
      name: string;
      url: string;
    };
  };
}

const metadataResponse: {
  [T in keyof MetadataTypes<keyof ReadonlyTuples>]: {
    [K in keyof ReadonlyTuples]?: MetadataTypes<K>[T];
  };
} & {
  files: typeof files;
} = {
  files,
  keys: {
    spreadsheet: spreadsheetMetadataKeys,
    form: formMetadataKeys,
  },
  metadata: {
    spreadsheet: {
      users: {
        name: '유저',
        url: 'https://docs.google.com/spreadsheets/d/12vGyGPIV4TE4suQXJQWtjaDaPXRRrbCoDJcJmyUyOu4/edit',
      },
      entries: {
        name: '응모',
        url: 'https://docs.google.com/spreadsheets/d/18P1_E2JMjaa5ZHHu3lgfosne62JkmpTYWjUWq32XWps/edit',
      },
      purchases: {
        name: '구매',
        url: 'https://docs.google.com/spreadsheets/d/1VZxWqXtra1Uc6f1i-XzwJkDXgvwTiDdIBtBdkyb2XVA/edit',
      },
      deliveries: {
        name: '배송',
        url: 'https://docs.google.com/spreadsheets/d/1xwETLSTuayZcFStGNfztlbpsbc93qkd8ZqNAMiN5wtM/edit',
      },
      others: {
        name: '기타',
        url: 'https://docs.google.com/spreadsheets/d/1KN679rXi5YSof7CUsCgqKQQJvkezcQrzuRcJcX7ZaY0/edit',
      },
    },

    // form 작성 아직
    form: {
      firstEntryForEvent: {
        name: '',
        url: '',
      },
      firstEntryForSpecialGoods: {
        name: '',
        url: '',
      },
      additionalEntryForEvent: {
        name: '',
        url: '',
      },
      additionalEntryForSpecialGoods: {
        name: '',
        url: '',
      },
    },
  },
};

router.get('/', versionsController.getVersions);

router.get('/metadata', (_, res) => res.json(metadataResponse));

export default router;
